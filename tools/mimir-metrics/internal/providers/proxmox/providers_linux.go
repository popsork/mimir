//go:build linux

package proxmox

import (
	"mimir-metrics/internal/config"
	"mimir-metrics/internal/providers"
)

func Providers(cfg config.Config) []providers.Provider {
	var out []providers.Provider
	if cfg.EnableProxmox {
		out = append(out, New(cfg))
	}
	if cfg.EnableProxmoxAPI && cfg.ProxmoxAPIURL != "" && cfg.ProxmoxAPINode != "" && cfg.ProxmoxAPIToken != "" {
		out = append(out, NewAPI(cfg))
	}
	if len(out) == 0 {
		return nil
	}
	return out
}
