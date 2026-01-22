//go:build darwin

package temps

import "mimir-metrics/internal/providers"

func Providers() []providers.Provider {
	return []providers.Provider{New()}
}
