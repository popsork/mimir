//go:build linux

package docker

import (
	"mimir-metrics/internal/config"
	"mimir-metrics/internal/providers"
)

func Providers(cfg config.Config) []providers.Provider {
	if !cfg.EnableDocker {
		return nil
	}
	return []providers.Provider{New(cfg)}
}
