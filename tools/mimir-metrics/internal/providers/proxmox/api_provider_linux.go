//go:build linux

package proxmox

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
)

type APIProvider struct {
	host        string
	baseURL     string
	node        string
	token       string
	skipVerify  bool
	interval    time.Duration
	nextAllowed time.Time
	backoff     time.Duration
	client      *http.Client
}

type proxmoxListResponse struct {
	Data []proxmoxVM `json:"data"`
}

type proxmoxVM struct {
	ID   int    `json:"vmid"`
	Name string `json:"name"`
}

type proxmoxStatusResponse struct {
	Data proxmoxStatus `json:"data"`
}

type proxmoxStatus struct {
	Mem     uint64 `json:"mem"`
	MaxMem  uint64 `json:"maxmem"`
	Disk    uint64 `json:"disk"`
	MaxDisk uint64 `json:"maxdisk"`
	Status  string `json:"status"`
}

func NewAPI(cfg config.Config) *APIProvider {
	return &APIProvider{
		host:       cfg.Host,
		baseURL:    strings.TrimSpace(cfg.ProxmoxAPIURL),
		node:       strings.TrimSpace(cfg.ProxmoxAPINode),
		token:      strings.TrimSpace(cfg.ProxmoxAPIToken),
		skipVerify: cfg.ProxmoxAPISkipVerify,
		interval:   cfg.ProxmoxAPIIntervalDuration(),
	}
}

func (p *APIProvider) Name() string {
	return "proxmox_api"
}

func (p *APIProvider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	now := time.Now()
	if p.shouldSkip(now) {
		return nil, nil
	}

	client, err := p.ensureClient()
	if err != nil {
		p.onError(now)
		return nil, err
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	lxc, err := p.listVMs(timeoutCtx, client, "lxc")
	if err != nil {
		p.onError(now)
		return nil, err
	}
	qemu, err := p.listVMs(timeoutCtx, client, "qemu")
	if err != nil {
		p.onError(now)
		return nil, err
	}

	out := make([]metrics.Metric, 0, (len(lxc)+len(qemu))*6)
	out = append(out, p.collectStats(timeoutCtx, client, "lxc", lxc, now)...)
	out = append(out, p.collectStats(timeoutCtx, client, "qemu", qemu, now)...)

	p.onSuccess(now)
	return out, nil
}

func (p *APIProvider) collectStats(ctx context.Context, client *http.Client, kind string, vms []proxmoxVM, now time.Time) []metrics.Metric {
	out := make([]metrics.Metric, 0, len(vms)*4)
	for _, vm := range vms {
		status, err := p.fetchStatus(ctx, client, kind, vm.ID)
		if err != nil {
			continue
		}

		container := strings.TrimSpace(vm.Name)
		if container == "" {
			container = strconv.Itoa(vm.ID)
		}

		if status.MaxDisk > 0 {
			diskUsed := status.Disk
			diskLimit := status.MaxDisk
			diskFree := uint64(0)
			if diskLimit > diskUsed {
				diskFree = diskLimit - diskUsed
			}
			out = append(out, metricWithTopic(p.host, container, "disk_used_bytes", float64(diskUsed), "bytes", now))
			out = append(out, metricWithTopic(p.host, container, "disk_limit_bytes", float64(diskLimit), "bytes", now))
			out = append(out, metricWithTopic(p.host, container, "disk_free_bytes", float64(diskFree), "bytes", now))
			out = append(out, metricWithTopic(p.host, container, "disk_usage_pct", float64(diskUsed)/float64(diskLimit)*100.0, "pct", now))
		}

		if status.MaxMem > 0 {
			memFree := uint64(0)
			if status.MaxMem > status.Mem {
				memFree = status.MaxMem - status.Mem
			}
			out = append(out, metricWithTopic(p.host, container, "mem_free_bytes", float64(memFree), "bytes", now))
		}
	}
	return out
}

func (p *APIProvider) ensureClient() (*http.Client, error) {
	if p.client != nil {
		return p.client, nil
	}
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: p.skipVerify},
	}
	p.client = &http.Client{Transport: transport}
	return p.client, nil
}

func (p *APIProvider) listVMs(ctx context.Context, client *http.Client, kind string) ([]proxmoxVM, error) {
	endpoint, err := joinURL(p.baseURL, fmt.Sprintf("/api2/json/nodes/%s/%s", p.node, kind))
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	p.addAuth(req)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("proxmox api %s list failed: %s", kind, resp.Status)
	}
	var payload proxmoxListResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload.Data, nil
}

func (p *APIProvider) fetchStatus(ctx context.Context, client *http.Client, kind string, id int) (proxmoxStatus, error) {
	endpoint, err := joinURL(p.baseURL, fmt.Sprintf("/api2/json/nodes/%s/%s/%d/status/current", p.node, kind, id))
	if err != nil {
		return proxmoxStatus{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return proxmoxStatus{}, err
	}
	p.addAuth(req)
	resp, err := client.Do(req)
	if err != nil {
		return proxmoxStatus{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return proxmoxStatus{}, fmt.Errorf("proxmox api %s status %d failed: %s", kind, id, resp.Status)
	}
	var payload proxmoxStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return proxmoxStatus{}, err
	}
	return payload.Data, nil
}

func (p *APIProvider) addAuth(req *http.Request) {
	token := p.token
	if token == "" {
		return
	}
	if !strings.HasPrefix(token, "PVEAPIToken=") {
		token = "PVEAPIToken=" + token
	}
	req.Header.Set("Authorization", token)
}

func joinURL(base, endpoint string) (string, error) {
	baseURL, err := url.Parse(base)
	if err != nil {
		return "", err
	}
	endpointURL, err := url.Parse(endpoint)
	if err != nil {
		return "", err
	}
	baseURL.Path = path.Join(baseURL.Path, endpointURL.Path)
	baseURL.RawQuery = endpointURL.RawQuery
	return baseURL.String(), nil
}

func (p *APIProvider) shouldSkip(now time.Time) bool {
	return !p.nextAllowed.IsZero() && now.Before(p.nextAllowed)
}

func (p *APIProvider) onSuccess(now time.Time) {
	p.backoff = 0
	if p.interval > 0 {
		p.nextAllowed = now.Add(p.interval)
	} else {
		p.nextAllowed = now
	}
}

func (p *APIProvider) onError(now time.Time) {
	if p.backoff <= 0 {
		p.backoff = time.Second
	} else {
		p.backoff *= 2
		if p.backoff > time.Minute {
			p.backoff = time.Minute
		}
	}
	p.nextAllowed = now.Add(p.backoff)
}
