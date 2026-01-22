//go:build !linux

package docker

import (
	"mimir-metrics/internal/config"
	"mimir-metrics/internal/providers"
)

func Providers(_ config.Config) []providers.Provider {
	return nil
}
