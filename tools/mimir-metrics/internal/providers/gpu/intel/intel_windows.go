//go:build windows && !intelmd

package intel

import (
	"context"
	"log"
	"sync"

	"mimir-metrics/internal/metrics"
)

type Provider struct {
	once sync.Once
}

func New() *Provider {
	return &Provider{}
}

func (Provider) Name() string {
	return "gpu-intel"
}

func (p *Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	p.once.Do(func() {
		log.Printf("intel gpu metrics disabled: wire up Intel Metrics Discovery SDK for temps/power/vram")
	})
	return nil, nil
}
