package providers

import (
	"context"
	"strings"

	"mimir-metrics/internal/metrics"
	"mimir-metrics/internal/utils"
)

type Provider interface {
	Name() string
	Collect(ctx context.Context) ([]metrics.Metric, error)
}

func BuildTopic(parts ...string) string {
	trimmed := make([]string, 0, len(parts))
	for _, part := range parts {
		if part == "" {
			continue
		}
		trimmed = append(trimmed, utils.SanitizeTopicPart(part))
	}
	return strings.Join(trimmed, "/")
}
