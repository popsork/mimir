package disk

import (
	"context"
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v3/disk"

	"mimir-metrics/internal/metrics"
)

type Provider struct {
	Paths []string
}

func New(paths []string) Provider {
	return Provider{Paths: paths}
}

func (Provider) Name() string {
	return "disk"
}

func (p Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	if len(p.Paths) == 0 {
		return nil, fmt.Errorf("disk paths not configured")
	}

	var total uint64
	var used uint64
	var hadSuccess bool
	for _, path := range p.Paths {
		usage, err := disk.Usage(path)
		if err != nil {
			continue
		}
		hadSuccess = true
		total += usage.Total
		used += usage.Used
	}

	if !hadSuccess {
		return nil, fmt.Errorf("no disk usage data available")
	}

	usedPct := 0.0
	if total > 0 {
		usedPct = (float64(used) / float64(total)) * 100
	}

	now := time.Now()
	return []metrics.Metric{
		{
			Device:    "disk",
			Name:      "used",
			Value:     float64(used),
			Unit:      "bytes",
			Source:    "gopsutil",
			Timestamp: now,
		},
		{
			Device:    "disk",
			Name:      "total",
			Value:     float64(total),
			Unit:      "bytes",
			Source:    "gopsutil",
			Timestamp: now,
		},
		{
			Device:    "disk",
			Name:      "usage",
			Value:     usedPct,
			Unit:      "pct",
			Source:    "gopsutil",
			Timestamp: now,
		},
	}, nil
}
