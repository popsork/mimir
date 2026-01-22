//go:build linux

package gpu

import (
	"mimir-metrics/internal/providers"
	"mimir-metrics/internal/providers/gpu/nvidia"
)

func Providers() []providers.Provider {
	return []providers.Provider{
		nvidia.New(),
	}
}
