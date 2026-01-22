package utils

import "strings"

// SanitizeTopicPart replaces invalid characters in a topic part with underscores.
func SanitizeTopicPart(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, "/", "_")
	value = strings.ReplaceAll(value, " ", "_")
	value = strings.ReplaceAll(value, "+", "_")
	value = strings.ReplaceAll(value, "#", "_")
	return value
}
