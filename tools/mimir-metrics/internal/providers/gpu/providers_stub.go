//go:build !linux && !windows

package gpu

import "mimir-metrics/internal/providers"

func Providers() []providers.Provider {
	return nil
}
