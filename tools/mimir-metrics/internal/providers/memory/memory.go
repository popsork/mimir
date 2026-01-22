package memory

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/mem"

	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return "memory"
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	vm, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}
	swap, _ := mem.SwapMemory()
	now := time.Now()
	metricsOut := []metrics.Metric{
		{
			Device:    "mem",
			Name:      "used",
			Value:     float64(vm.Used),
			Unit:      "bytes",
			Source:    "gopsutil",
			Timestamp: now,
		},
		{
			Device:    "mem",
			Name:      "total",
			Value:     float64(vm.Total),
			Unit:      "bytes",
			Source:    "gopsutil",
			Timestamp: now,
		},
		{
			Device:    "mem",
			Name:      "usage",
			Value:     vm.UsedPercent,
			Unit:      "pct",
			Source:    "gopsutil",
			Timestamp: now,
		},
	}
	if swap != nil {
		metricsOut = append(metricsOut,
			metrics.Metric{Device: "swap", Name: "used", Value: float64(swap.Used), Unit: "bytes", Source: "gopsutil", Timestamp: now},
			metrics.Metric{Device: "swap", Name: "total", Value: float64(swap.Total), Unit: "bytes", Source: "gopsutil", Timestamp: now},
			metrics.Metric{Device: "swap", Name: "usage", Value: swap.UsedPercent, Unit: "pct", Source: "gopsutil", Timestamp: now},
		)
	}
	return metricsOut, nil
}
