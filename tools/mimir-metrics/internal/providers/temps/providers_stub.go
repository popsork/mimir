//go:build !linux && !darwin

package temps

import "mimir-metrics/internal/providers"

func Providers() []providers.Provider {
	return nil
}
