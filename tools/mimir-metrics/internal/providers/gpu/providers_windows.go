//go:build windows

package gpu

import (
	"mimir-metrics/internal/providers"
	"mimir-metrics/internal/providers/gpu/intel"
)

func Providers() []providers.Provider {
	return []providers.Provider{
		intel.New(),
	}
}
