package diskio

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/disk"

	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return "diskio"
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	stats, err := disk.IOCounters()
	if err != nil {
		return nil, err
	}
	if len(stats) == 0 {
		return nil, nil
	}

	var readBytes uint64
	var writeBytes uint64
	var readCount uint64
	var writeCount uint64
	var readTime uint64
	var writeTime uint64
	var ioTime uint64

	for _, stat := range stats {
		readBytes += stat.ReadBytes
		writeBytes += stat.WriteBytes
		readCount += stat.ReadCount
		writeCount += stat.WriteCount
		readTime += stat.ReadTime
		writeTime += stat.WriteTime
		ioTime += stat.IoTime
	}

	now := time.Now()
	return []metrics.Metric{
		{Device: "diskio", Name: "read_bytes", Value: float64(readBytes), Unit: "bytes", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "write_bytes", Value: float64(writeBytes), Unit: "bytes", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "read_ops", Value: float64(readCount), Unit: "ops", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "write_ops", Value: float64(writeCount), Unit: "ops", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "read_time_ms", Value: float64(readTime), Unit: "ms", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "write_time_ms", Value: float64(writeTime), Unit: "ms", Source: "gopsutil", Timestamp: now},
		{Device: "diskio", Name: "io_time_ms", Value: float64(ioTime), Unit: "ms", Source: "gopsutil", Timestamp: now},
	}, nil
}
