//go:build linux

package docker

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
	"mimir-metrics/internal/providers"
)

type Provider struct {
	socket      string
	interval    time.Duration
	nextAllowed time.Time
	backoff     time.Duration
	client      *http.Client
	host        string
	infoCache   map[string]string
}

type infoPayload struct {
	ID      string `json:"id"`
	Image   string `json:"image"`
	Created string `json:"created"`
}

func New(cfg config.Config) *Provider {
	return &Provider{
		socket:    cfg.DockerSocket,
		interval:  cfg.DockerIntervalDuration(),
		host:      cfg.Host,
		infoCache: make(map[string]string),
	}
}

func (p *Provider) Name() string {
	return "docker"
}

func (p *Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	now := time.Now()
	if p.shouldSkip(now) {
		return nil, nil
	}

	client, baseURL, err := p.ensureClient()
	if err != nil {
		p.onError(now)
		return nil, err
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()

	containers, err := p.listContainers(timeoutCtx, client, baseURL)
	if err != nil {
		p.onError(now)
		p.client = nil
		return nil, err
	}

	out := make([]metrics.Metric, 0, len(containers)*6)
	for _, container := range containers {
		name := containerName(container)
		if name == "" {
			name = container.ID
		}
		created := ""
		if container.Created > 0 {
			created = time.Unix(container.Created, 0).UTC().Format(time.RFC3339)
		}
		info := infoPayload{
			ID:      container.ID,
			Image:   container.Image,
			Created: created,
		}
		infoHash := fmt.Sprintf("%s|%s|%s", info.ID, info.Image, info.Created)
		if p.infoCache[name] != infoHash {
			p.infoCache[name] = infoHash
			out = append(out, metrics.Metric{
				Device:    name,
				Name:      "$info",
				Source:    "docker",
				Payload:   info,
				Timestamp: now,
				Topic:     providers.BuildTopic("metrics", "docker", p.host, name, "$info"),
			})
		}

		statusValue := 0.0
		if strings.EqualFold(container.State, "running") {
			statusValue = 1
		}
		out = append(out, metricWithTopic(p.host, name, "status", statusValue, "bool", now))

		if container.Created > 0 {
			uptime := now.Sub(time.Unix(container.Created, 0)).Seconds()
			out = append(out, metricWithTopic(p.host, name, "uptime_seconds", uptime, "seconds", now))
		}

		if !strings.EqualFold(container.State, "running") {
			continue
		}

		stats, err := p.fetchStats(timeoutCtx, client, baseURL, container.ID)
		if err != nil {
			continue
		}

		out = append(out, metricWithTopic(p.host, name, "cpu_usage_pct", cpuPercent(stats), "pct", now))

		memUsage := float64(stats.MemoryStats.Usage)
		memLimit := float64(stats.MemoryStats.Limit)
		out = append(out, metricWithTopic(p.host, name, "mem_used_bytes", memUsage, "bytes", now))
		if memLimit > 0 {
			out = append(out, metricWithTopic(p.host, name, "mem_limit_bytes", memLimit, "bytes", now))
			out = append(out, metricWithTopic(p.host, name, "mem_usage_pct", (memUsage/memLimit)*100.0, "pct", now))
		}

		rx, tx := netTotals(stats)
		out = append(out, metricWithTopic(p.host, name, "net_rx_bytes", float64(rx), "bytes", now))
		out = append(out, metricWithTopic(p.host, name, "net_tx_bytes", float64(tx), "bytes", now))

		blkRead, blkWrite := blkioTotals(stats)
		out = append(out, metricWithTopic(p.host, name, "blk_read_bytes", float64(blkRead), "bytes", now))
		out = append(out, metricWithTopic(p.host, name, "blk_write_bytes", float64(blkWrite), "bytes", now))
	}

	p.onSuccess(now)
	return out, nil
}

func (p *Provider) shouldSkip(now time.Time) bool {
	return !p.nextAllowed.IsZero() && now.Before(p.nextAllowed)
}

func (p *Provider) onSuccess(now time.Time) {
	p.backoff = 0
	if p.interval > 0 {
		p.nextAllowed = now.Add(p.interval)
	} else {
		p.nextAllowed = now
	}
}

func (p *Provider) onError(now time.Time) {
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

func (p *Provider) ensureClient() (*http.Client, string, error) {
	if p.client != nil {
		return p.client, "http://unix", nil
	}
	socket := strings.TrimSpace(p.socket)
	if socket == "" {
		socket = "/var/run/docker.sock"
	}
	transport := &http.Transport{
		DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
			return (&net.Dialer{}).DialContext(ctx, "unix", socket)
		},
	}
	p.client = &http.Client{Transport: transport}
	return p.client, "http://unix", nil
}

type dockerContainer struct {
	ID      string   `json:"Id"`
	Names   []string `json:"Names"`
	Image   string   `json:"Image"`
	Created int64    `json:"Created"`
	State   string   `json:"State"`
	Status  string   `json:"Status"`
}

type dockerStats struct {
	CPUStats struct {
		CPUUsage struct {
			TotalUsage uint64   `json:"total_usage"`
			Percpu     []uint64 `json:"percpu_usage"`
		} `json:"cpu_usage"`
		SystemUsage uint64 `json:"system_cpu_usage"`
		OnlineCPUs  uint32 `json:"online_cpus"`
	} `json:"cpu_stats"`
	PreCPUStats struct {
		CPUUsage struct {
			TotalUsage uint64   `json:"total_usage"`
			Percpu     []uint64 `json:"percpu_usage"`
		} `json:"cpu_usage"`
		SystemUsage uint64 `json:"system_cpu_usage"`
		OnlineCPUs  uint32 `json:"online_cpus"`
	} `json:"precpu_stats"`
	MemoryStats struct {
		Usage uint64 `json:"usage"`
		Limit uint64 `json:"limit"`
	} `json:"memory_stats"`
	Networks map[string]struct {
		RxBytes uint64 `json:"rx_bytes"`
		TxBytes uint64 `json:"tx_bytes"`
	} `json:"networks"`
	BlkioStats struct {
		IoServiceBytesRecursive []struct {
			Op    string `json:"op"`
			Value uint64 `json:"value"`
		} `json:"io_service_bytes_recursive"`
	} `json:"blkio_stats"`
}

func (p *Provider) listContainers(ctx context.Context, client *http.Client, baseURL string) ([]dockerContainer, error) {
	endpoint, err := joinURL(baseURL, "/containers/json")
	if err != nil {
		return nil, err
	}
	q := url.Values{}
	q.Set("all", "1")
	endpoint = endpoint + "?" + q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("docker list containers: %s", resp.Status)
	}
	var containers []dockerContainer
	if err := json.NewDecoder(resp.Body).Decode(&containers); err != nil {
		return nil, err
	}
	return containers, nil
}

func (p *Provider) fetchStats(ctx context.Context, client *http.Client, baseURL, id string) (*dockerStats, error) {
	endpoint, err := joinURL(baseURL, "/containers/"+id+"/stats")
	if err != nil {
		return nil, err
	}
	q := url.Values{}
	q.Set("stream", "false")
	endpoint = endpoint + "?" + q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("docker stats: %s", resp.Status)
	}
	var stats dockerStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, err
	}
	return &stats, nil
}

func joinURL(base, p string) (string, error) {
	u, err := url.Parse(base)
	if err != nil {
		return "", err
	}
	if u.Scheme == "" {
		return "", errors.New("missing url scheme")
	}
	u.Path = path.Join(u.Path, p)
	return u.String(), nil
}

func containerName(container dockerContainer) string {
	if len(container.Names) == 0 {
		return ""
	}
	name := strings.TrimSpace(container.Names[0])
	return strings.TrimPrefix(name, "/")
}

func cpuPercent(stats *dockerStats) float64 {
	cpuDelta := float64(stats.CPUStats.CPUUsage.TotalUsage - stats.PreCPUStats.CPUUsage.TotalUsage)
	systemDelta := float64(stats.CPUStats.SystemUsage - stats.PreCPUStats.SystemUsage)
	if cpuDelta <= 0 || systemDelta <= 0 {
		return 0
	}
	onlineCPUs := float64(len(stats.CPUStats.CPUUsage.Percpu))
	if onlineCPUs == 0 {
		if stats.CPUStats.OnlineCPUs > 0 {
			onlineCPUs = float64(stats.CPUStats.OnlineCPUs)
		} else {
			onlineCPUs = 1
		}
	}
	return (cpuDelta / systemDelta) * onlineCPUs * 100.0
}

func netTotals(stats *dockerStats) (uint64, uint64) {
	var rx, tx uint64
	for _, net := range stats.Networks {
		rx += net.RxBytes
		tx += net.TxBytes
	}
	return rx, tx
}

func blkioTotals(stats *dockerStats) (uint64, uint64) {
	var read, write uint64
	for _, entry := range stats.BlkioStats.IoServiceBytesRecursive {
		switch strings.ToLower(entry.Op) {
		case "read":
			read += entry.Value
		case "write":
			write += entry.Value
		}
	}
	return read, write
}

func metricWithTopic(host, container, name string, value float64, unit string, now time.Time) metrics.Metric {
	return metrics.Metric{
		Device:    container,
		Name:      name,
		Value:     value,
		Unit:      unit,
		Source:    "docker",
		Timestamp: now,
		Topic:     providers.BuildTopic("metrics", "docker", host, container, name),
	}
}
