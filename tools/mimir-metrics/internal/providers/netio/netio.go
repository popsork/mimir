package netio

import (
	"context"
	"time"

	"github.com/shirou/gopsutil/v3/net"

	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return "netio"
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	stats, err := net.IOCounters(false)
	if err != nil {
		return nil, err
	}
	if len(stats) == 0 {
		return nil, nil
	}

	s := stats[0]
	now := time.Now()
	return []metrics.Metric{
		{Device: "net", Name: "bytes_in", Value: float64(s.BytesRecv), Unit: "bytes", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "bytes_out", Value: float64(s.BytesSent), Unit: "bytes", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "packets_in", Value: float64(s.PacketsRecv), Unit: "packets", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "packets_out", Value: float64(s.PacketsSent), Unit: "packets", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "errors_in", Value: float64(s.Errin), Unit: "count", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "errors_out", Value: float64(s.Errout), Unit: "count", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "drops_in", Value: float64(s.Dropin), Unit: "count", Source: "gopsutil", Timestamp: now},
		{Device: "net", Name: "drops_out", Value: float64(s.Dropout), Unit: "count", Source: "gopsutil", Timestamp: now},
	}, nil
}
