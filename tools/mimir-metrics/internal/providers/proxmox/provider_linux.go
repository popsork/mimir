//go:build linux

package proxmox

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v3/process"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
	"mimir-metrics/internal/providers"
)

type Provider struct {
	host        string
	interval    time.Duration
	nextAllowed time.Time
	backoff     time.Duration
	infoCache   map[string]string
	prevCPU     map[string]cpuSample
}

type cpuSample struct {
	usageSeconds float64
	ts           time.Time
}

type scopeInfo struct {
	ID      string
	Name    string
	Kind    string
	Path    string
	RelPath string
}

type infoPayload struct {
	ID      string `json:"id"`
	Image   string `json:"image"`
	Created string `json:"created"`
}

func New(cfg config.Config) *Provider {
	return &Provider{
		host:      cfg.Host,
		interval:  cfg.ProxmoxIntervalDuration(),
		infoCache: make(map[string]string),
		prevCPU:   make(map[string]cpuSample),
	}
}

func (p *Provider) Name() string {
	return "proxmox"
}

func (p *Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	now := time.Now()
	if p.shouldSkip(now) {
		return nil, nil
	}

	scopes, v2, err := findProxmoxScopes()
	if err != nil {
		p.onError(now)
		return nil, err
	}

	out := make([]metrics.Metric, 0, len(scopes)*6)
	for _, scope := range scopes {
		container := scope.Name
		if container == "" {
			container = scope.ID
		}

		info := infoPayload{
			ID:      scope.ID,
			Image:   scopeImage(scope),
			Created: "",
		}
		infoHash := fmt.Sprintf("%s|%s|%s", info.ID, info.Image, info.Created)
		if p.infoCache[container] != infoHash {
			p.infoCache[container] = infoHash
			out = append(out, metrics.Metric{
				Device:    container,
				Name:      "$info",
				Source:    "proxmox",
				Payload:   info,
				Timestamp: now,
				Topic:     providers.BuildTopic("metrics", "proxmox", p.host, container, "$info"),
			})
		}

		paths := cgroupPaths(scope, v2)
		pid, hasPID := firstPID(paths.Procs)
		statusValue := 0.0
		if hasPID {
			statusValue = 1
		}
		out = append(out, metricWithTopic(p.host, container, "status", statusValue, "bool", now))

		if hasPID {
			if uptimeSeconds, ok := processUptime(pid, now); ok {
				out = append(out, metricWithTopic(p.host, container, "uptime_seconds", uptimeSeconds, "seconds", now))
			}
		}

		if cpuUsage, ok := readCPUUsageSeconds(paths); ok {
			if cpuPercent, ok := p.cpuPercent(scope.ID, cpuUsage, now); ok {
				out = append(out, metricWithTopic(p.host, container, "cpu_usage_pct", cpuPercent, "pct", now))
			}
		}

		if memUsage, memLimit, ok := readMemUsage(paths); ok {
			out = append(out, metricWithTopic(p.host, container, "mem_used_bytes", float64(memUsage), "bytes", now))
			if memLimit > 0 {
				out = append(out, metricWithTopic(p.host, container, "mem_limit_bytes", float64(memLimit), "bytes", now))
				out = append(out, metricWithTopic(p.host, container, "mem_usage_pct", float64(memUsage)/float64(memLimit)*100.0, "pct", now))
			}
		}

		if hasPID {
			if rx, tx, ok := readNetDev(pid); ok {
				out = append(out, metricWithTopic(p.host, container, "net_rx_bytes", float64(rx), "bytes", now))
				out = append(out, metricWithTopic(p.host, container, "net_tx_bytes", float64(tx), "bytes", now))
			}
		}

		if blkRead, blkWrite, ok := readBlkio(paths); ok {
			out = append(out, metricWithTopic(p.host, container, "blk_read_bytes", float64(blkRead), "bytes", now))
			out = append(out, metricWithTopic(p.host, container, "blk_write_bytes", float64(blkWrite), "bytes", now))
		}
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

func (p *Provider) cpuPercent(id string, usageSeconds float64, now time.Time) (float64, bool) {
	prev, ok := p.prevCPU[id]
	p.prevCPU[id] = cpuSample{usageSeconds: usageSeconds, ts: now}
	if !ok {
		return 0, false
	}
	deltaUsage := usageSeconds - prev.usageSeconds
	deltaTime := now.Sub(prev.ts).Seconds()
	if deltaUsage <= 0 || deltaTime <= 0 {
		return 0, false
	}
	cpuCount := float64(runtime.NumCPU())
	if cpuCount <= 0 {
		cpuCount = 1
	}
	return (deltaUsage / deltaTime) * 100.0 / cpuCount, true
}

type cgroupPathsInfo struct {
	CPU    string
	MemCur string
	MemMax string
	BlkIO  string
	Procs  string
	V2     bool
}

func cgroupPaths(scope scopeInfo, v2 bool) cgroupPathsInfo {
	if v2 {
		return cgroupPathsInfo{
			CPU:    filepath.Join(scope.Path, "cpu.stat"),
			MemCur: filepath.Join(scope.Path, "memory.current"),
			MemMax: filepath.Join(scope.Path, "memory.max"),
			BlkIO:  filepath.Join(scope.Path, "io.stat"),
			Procs:  filepath.Join(scope.Path, "cgroup.procs"),
			V2:     true,
		}
	}
	rel := scope.RelPath
	return cgroupPathsInfo{
		CPU:    filepath.Join("/sys/fs/cgroup/cpuacct", rel, "cpuacct.usage"),
		MemCur: filepath.Join("/sys/fs/cgroup/memory", rel, "memory.usage_in_bytes"),
		MemMax: filepath.Join("/sys/fs/cgroup/memory", rel, "memory.limit_in_bytes"),
		BlkIO:  filepath.Join("/sys/fs/cgroup/blkio", rel, "blkio.throttle.io_service_bytes"),
		Procs:  filepath.Join("/sys/fs/cgroup/cpuacct", rel, "cgroup.procs"),
		V2:     false,
	}
}

func findProxmoxScopes() ([]scopeInfo, bool, error) {
	if isCgroupV2() {
		scopes, err := findScopesV2()
		return scopes, true, err
	}
	scopes, err := findScopesV1()
	return scopes, false, err
}

func isCgroupV2() bool {
	_, err := os.Stat("/sys/fs/cgroup/cgroup.controllers")
	return err == nil
}

func findScopesV2() ([]scopeInfo, error) {
	base := "/sys/fs/cgroup/machine.slice"
	if entries, err := os.ReadDir(base); err == nil {
		return parseScopes(entries, base, "machine.slice"), nil
	}
	if scopes, err := scanV2ProxmoxDirs(); err == nil {
		return scopes, nil
	}
	return scanUnifiedCgroupV2("/sys/fs/cgroup")
}

func findScopesV1() ([]scopeInfo, error) {
	base := "/sys/fs/cgroup/cpuacct/machine.slice"
	if entries, err := os.ReadDir(base); err == nil {
		return parseScopes(entries, base, "machine.slice"), nil
	}
	return scanLegacyCgroupV1()
}

func parseScopes(entries []os.DirEntry, base, relBase string) []scopeInfo {
	var scopes []scopeInfo
	for _, entry := range entries {
		path := filepath.Join(base, entry.Name())
		info, err := os.Stat(path)
		if err != nil || !info.IsDir() {
			continue
		}
		name := entry.Name()
		if strings.HasPrefix(name, "machine-lxc") {
			id := parseScopeID(name, "machine-lxc\\x2d")
			scopes = append(scopes, scopeInfo{
				ID:      id,
				Name:    readProxmoxName("lxc", id),
				Kind:    "lxc",
				Path:    path,
				RelPath: filepath.Join(relBase, name),
			})
			continue
		}
		if strings.HasPrefix(name, "machine-qemu") {
			id := parseScopeID(name, "machine-qemu\\x2d")
			scopes = append(scopes, scopeInfo{
				ID:      id,
				Name:    readProxmoxName("qemu", id),
				Kind:    "qemu",
				Path:    path,
				RelPath: filepath.Join(relBase, name),
			})
			continue
		}
	}
	return scopes
}

func parseScopeID(name, prefix string) string {
	id := strings.TrimPrefix(name, prefix)
	id = strings.TrimSuffix(id, ".scope")
	id = strings.ReplaceAll(id, "\\x2d", "-")
	return id
}

func scanUnifiedCgroupV2(root string) ([]scopeInfo, error) {
	var scopes []scopeInfo
	candidates := []string{
		filepath.Join(root, "machine.slice"),
		filepath.Join(root, "system.slice"),
		filepath.Join(root, "pve.slice"),
		root,
	}
	seen := make(map[string]struct{})
	for _, base := range candidates {
		info, err := os.Stat(base)
		if err != nil || !info.IsDir() {
			continue
		}
		entries, err := os.ReadDir(base)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			path := filepath.Join(base, entry.Name())
			info, err := os.Stat(path)
			if err != nil || !info.IsDir() {
				continue
			}
			name := entry.Name()
			if !strings.Contains(name, "lxc") && !strings.Contains(name, "qemu") {
				continue
			}
			if _, ok := seen[path]; ok {
				continue
			}
			seen[path] = struct{}{}
			scopes = append(scopes, scopeFromName(path, name, ""))
		}
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("no proxmox cgroup scopes found")
	}
	return scopes, nil
}

func scanV2ProxmoxDirs() ([]scopeInfo, error) {
	var scopes []scopeInfo
	lxcBase := "/sys/fs/cgroup/lxc"
	if entries, err := os.ReadDir(lxcBase); err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			id := parseScopeIDFromName(entry.Name())
			scopes = append(scopes, scopeInfo{
				ID:   id,
				Name: readProxmoxName("lxc", id),
				Kind: "lxc",
				Path: filepath.Join(lxcBase, entry.Name()),
			})
		}
	}
	qemuBase := "/sys/fs/cgroup/qemu.slice"
	if entries, err := os.ReadDir(qemuBase); err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			id := parseScopeIDFromName(entry.Name())
			scopes = append(scopes, scopeInfo{
				ID:   id,
				Name: readProxmoxName("qemu", id),
				Kind: "qemu",
				Path: filepath.Join(qemuBase, entry.Name()),
			})
		}
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("no proxmox cgroup scopes found")
	}
	return scopes, nil
}

func scanLegacyCgroupV1() ([]scopeInfo, error) {
	var scopes []scopeInfo
	paths := []struct {
		base string
		kind string
	}{
		{base: "/sys/fs/cgroup/cpuacct/lxc", kind: "lxc"},
		{base: "/sys/fs/cgroup/cpuacct/qemu", kind: "qemu"},
	}
	for _, candidate := range paths {
		entries, err := os.ReadDir(candidate.base)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			path := filepath.Join(candidate.base, entry.Name())
			info, err := os.Stat(path)
			if err != nil || !info.IsDir() {
				continue
			}
			rel := filepath.Join(filepath.Base(candidate.base), entry.Name())
			scope := scopeFromName(path, entry.Name(), rel)
			scope.Kind = candidate.kind
			scopes = append(scopes, scope)
		}
	}
	if len(scopes) == 0 {
		return nil, fmt.Errorf("no proxmox cgroup scopes found")
	}
	return scopes, nil
}

func scopeFromName(path, name, rel string) scopeInfo {
	kind := ""
	switch {
	case strings.Contains(name, "lxc"):
		kind = "lxc"
	case strings.Contains(name, "qemu"):
		kind = "qemu"
	}
	id := parseScopeIDFromName(name)
	return scopeInfo{
		ID:      id,
		Name:    readProxmoxName(kind, id),
		Kind:    kind,
		Path:    path,
		RelPath: rel,
	}
}

func parseScopeIDFromName(name string) string {
	if strings.HasPrefix(name, "machine-lxc") {
		return parseScopeID(name, "machine-lxc\\x2d")
	}
	if strings.HasPrefix(name, "machine-qemu") {
		return parseScopeID(name, "machine-qemu\\x2d")
	}
	name = strings.TrimSuffix(name, ".scope")
	name = strings.TrimSuffix(name, ".service")
	parts := strings.FieldsFunc(name, func(r rune) bool {
		return r == '@' || r == '-' || r == '_'
	})
	for _, part := range parts {
		if part == "" {
			continue
		}
		if _, err := strconv.Atoi(part); err == nil {
			return part
		}
	}
	return name
}

func scopeImage(scope scopeInfo) string {
	_, image := readProxmoxInfo(scope.Kind, scope.ID)
	return image
}

func readProxmoxName(kind, id string) string {
	name, _ := readProxmoxInfo(kind, id)
	return name
}

func readProxmoxInfo(kind, id string) (string, string) {
	var path string
	switch kind {
	case "lxc":
		path = filepath.Join("/etc/pve/lxc", id+".conf")
	case "qemu":
		path = filepath.Join("/etc/pve/qemu-server", id+".conf")
	default:
		return "", ""
	}

	file, err := os.Open(path)
	if err != nil {
		return "", ""
	}
	defer file.Close()

	var name string
	var image string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		switch key {
		case "hostname", "name":
			if name == "" {
				name = value
			}
		case "ostype":
			if image == "" {
				image = value
			}
		}
	}
	return name, image
}

func readCPUUsageSeconds(paths cgroupPathsInfo) (float64, bool) {
	data, err := os.ReadFile(paths.CPU)
	if err != nil {
		return 0, false
	}
	if paths.V2 {
		for _, line := range strings.Split(string(data), "\n") {
			fields := strings.Fields(line)
			if len(fields) == 2 && fields[0] == "usage_usec" {
				value, err := strconv.ParseFloat(fields[1], 64)
				if err != nil {
					return 0, false
				}
				return value / 1_000_000.0, true
			}
		}
		return 0, false
	}
	value, err := strconv.ParseFloat(strings.TrimSpace(string(data)), 64)
	if err != nil {
		return 0, false
	}
	return value / 1_000_000_000.0, true
}

func readMemUsage(paths cgroupPathsInfo) (uint64, uint64, bool) {
	usage, err := readUint64(paths.MemCur)
	if err != nil {
		return 0, 0, false
	}
	limit, err := readUint64(paths.MemMax)
	if err != nil {
		return 0, 0, false
	}
	return usage, limit, true
}

func readBlkio(paths cgroupPathsInfo) (uint64, uint64, bool) {
	data, err := os.ReadFile(paths.BlkIO)
	if err != nil {
		return 0, 0, false
	}
	if paths.V2 {
		read, write := parseBlkioV2(string(data))
		return read, write, true
	}
	read, write := parseBlkioV1(string(data))
	return read, write, true
}

func parseBlkioV2(data string) (uint64, uint64) {
	var read, write uint64
	for _, line := range strings.Split(data, "\n") {
		fields := strings.Fields(line)
		for _, field := range fields {
			if strings.HasPrefix(field, "rbytes=") {
				value, err := strconv.ParseUint(strings.TrimPrefix(field, "rbytes="), 10, 64)
				if err == nil {
					read += value
				}
			}
			if strings.HasPrefix(field, "wbytes=") {
				value, err := strconv.ParseUint(strings.TrimPrefix(field, "wbytes="), 10, 64)
				if err == nil {
					write += value
				}
			}
		}
	}
	return read, write
}

func parseBlkioV1(data string) (uint64, uint64) {
	var read, write uint64
	for _, line := range strings.Split(data, "\n") {
		fields := strings.Fields(line)
		if len(fields) < 3 {
			continue
		}
		op := strings.ToLower(fields[1])
		value, err := strconv.ParseUint(fields[2], 10, 64)
		if err != nil {
			continue
		}
		switch op {
		case "read":
			read += value
		case "write":
			write += value
		}
	}
	return read, write
}

func firstPID(path string) (int, bool) {
	data, err := os.ReadFile(path)
	if err != nil {
		alt := strings.Replace(path, "cgroup.procs", "tasks", 1)
		if alt != path {
			data, err = os.ReadFile(alt)
		}
		if err != nil {
			return 0, false
		}
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		pid, err := strconv.Atoi(line)
		if err == nil && pid > 0 {
			return pid, true
		}
	}
	return 0, false
}

func processUptime(pid int, now time.Time) (float64, bool) {
	proc, err := process.NewProcess(int32(pid))
	if err != nil {
		return 0, false
	}
	createdMs, err := proc.CreateTime()
	if err != nil {
		return 0, false
	}
	created := time.UnixMilli(createdMs)
	return now.Sub(created).Seconds(), true
}

func readNetDev(pid int) (uint64, uint64, bool) {
	path := filepath.Join("/proc", strconv.Itoa(pid), "net/dev")
	file, err := os.Open(path)
	if err != nil {
		return 0, 0, false
	}
	defer file.Close()

	var rx, tx uint64
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.Contains(line, "|") || !strings.Contains(line, ":") {
			continue
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		fields := strings.Fields(parts[1])
		if len(fields) < 10 {
			continue
		}
		rxVal, err1 := strconv.ParseUint(fields[0], 10, 64)
		txVal, err2 := strconv.ParseUint(fields[8], 10, 64)
		if err1 == nil {
			rx += rxVal
		}
		if err2 == nil {
			tx += txVal
		}
	}
	return rx, tx, true
}

func readUint64(path string) (uint64, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	value := strings.TrimSpace(string(data))
	if value == "max" {
		return 0, nil
	}
	return strconv.ParseUint(value, 10, 64)
}

func metricWithTopic(host, container, name string, value float64, unit string, now time.Time) metrics.Metric {
	return metrics.Metric{
		Device:    container,
		Name:      name,
		Value:     value,
		Unit:      unit,
		Source:    "proxmox",
		Timestamp: now,
		Topic:     providers.BuildTopic("metrics", "proxmox", host, container, name),
	}
}
