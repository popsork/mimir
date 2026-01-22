//go:build linux

package temps

import "mimir-metrics/internal/providers"

func Providers() []providers.Provider {
	return []providers.Provider{New()}
}
