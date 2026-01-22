package system

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/process"

	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return "system"
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx

	var out []metrics.Metric
	now := time.Now()

	if avg, err := load.Avg(); err == nil {
		out = append(out,
			metrics.Metric{Device: "system", Name: "load1", Value: avg.Load1, Unit: "load", Source: "gopsutil", Timestamp: now},
			metrics.Metric{Device: "system", Name: "load5", Value: avg.Load5, Unit: "load", Source: "gopsutil", Timestamp: now},
			metrics.Metric{Device: "system", Name: "load15", Value: avg.Load15, Unit: "load", Source: "gopsutil", Timestamp: now},
		)
	}

	if uptime, err := host.Uptime(); err == nil {
		out = append(out, metrics.Metric{Device: "system", Name: "uptime", Value: float64(uptime), Unit: "seconds", Source: "gopsutil", Timestamp: now})
	}

	if boot, err := host.BootTime(); err == nil {
		out = append(out, metrics.Metric{Device: "system", Name: "boot_time", Value: float64(boot), Unit: "unix_seconds", Source: "gopsutil", Timestamp: now})
	}

	if pids, err := process.Pids(); err == nil {
		out = append(out, metrics.Metric{Device: "system", Name: "processes", Value: float64(len(pids)), Unit: "count", Source: "gopsutil", Timestamp: now})
	}

	return out, nil
}
