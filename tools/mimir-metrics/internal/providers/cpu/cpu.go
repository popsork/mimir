package cpu

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"

	"mimir-metrics/internal/consts"
	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return consts.DeviceCPU
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	percents, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}
	if len(percents) == 0 {
		return nil, nil
	}
	return []metrics.Metric{
		{
			Device:    consts.DeviceCPU,
			Name:      consts.MetricUsage,
			Value:     percents[0],
			Unit:      consts.UnitPercent,
			Source:    "gopsutil",
			Timestamp: time.Now(),
		},
	}, nil
}
