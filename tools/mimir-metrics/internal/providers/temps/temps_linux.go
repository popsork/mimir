//go:build linux

package temps

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"mimir-metrics/internal/metrics"
)

type Provider struct{}

func New() Provider {
	return Provider{}
}

func (Provider) Name() string {
	return "temps"
}

func (Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx

	hwmonTemps, fanRPMs := collectHwmonTempsAndFans()
	thermalTemps := collectThermalZoneTemps()

	var out []metrics.Metric
	now := time.Now()

	if temp, source, ok := selectCPUTemp(hwmonTemps, thermalTemps); ok {
		out = append(out, metrics.Metric{
			Device:    "cpu",
			Name:      "temp",
			Value:     temp,
			Unit:      "C",
			Source:    source,
			Timestamp: now,
		})
	}

	if len(fanRPMs) > 0 {
		out = append(out, metrics.Metric{
			Device:    "fan",
			Name:      "rpm",
			Value:     maxFloat64(fanRPMs),
			Unit:      "rpm",
			Source:    "hwmon",
			Timestamp: now,
		})
	}

	return out, nil
}

func selectCPUTemp(hwmonTemps, thermalTemps []float64) (float64, string, bool) {
	if len(hwmonTemps) > 0 {
		return maxFloat64(hwmonTemps), "hwmon", true
	}
	if len(thermalTemps) > 0 {
		return maxFloat64(thermalTemps), "thermal", true
	}
	return 0, "", false
}

func collectHwmonTempsAndFans() ([]float64, []float64) {
	entries, err := os.ReadDir("/sys/class/hwmon")
	if err != nil {
		return nil, nil
	}

	var temps []float64
	var fans []float64
	for _, entry := range entries {
		hwmonPath := filepath.Join("/sys/class/hwmon", entry.Name())
		info, err := os.Stat(hwmonPath)
		if err != nil || !info.IsDir() {
			continue
		}
		name := readTrimmed(filepath.Join(hwmonPath, "name"))
		if name == "" {
			name = entry.Name()
		}

		files, err := os.ReadDir(hwmonPath)
		if err != nil {
			continue
		}
		for _, file := range files {
			if file.IsDir() {
				continue
			}
			fname := file.Name()
			switch {
			case strings.HasPrefix(fname, "temp") && strings.HasSuffix(fname, "_input"):
				idx := strings.TrimSuffix(strings.TrimPrefix(fname, "temp"), "_input")
				label := readTrimmed(filepath.Join(hwmonPath, fmt.Sprintf("temp%s_label", idx)))
				if label == "" {
					label = "temp" + idx
				}
				if !isCPUTempSource(name) && !isCPUTempSource(label) {
					continue
				}
				raw, err := readInt64(filepath.Join(hwmonPath, fname))
				if err != nil {
					continue
				}
				temps = append(temps, float64(raw)/1000.0)
			case strings.HasPrefix(fname, "fan") && strings.HasSuffix(fname, "_input"):
				raw, err := readInt64(filepath.Join(hwmonPath, fname))
				if err != nil {
					continue
				}
				fans = append(fans, float64(raw))
			}
		}
	}

	return temps, fans
}

func collectThermalZoneTemps() []float64 {
	entries, err := os.ReadDir("/sys/class/thermal")
	if err != nil {
		return nil
	}

	var temps []float64
	for _, entry := range entries {
		if !strings.HasPrefix(entry.Name(), "thermal_zone") {
			continue
		}
		zonePath := filepath.Join("/sys/class/thermal", entry.Name())
		info, err := os.Stat(zonePath)
		if err != nil || !info.IsDir() {
			continue
		}
		zoneType := readTrimmed(filepath.Join(zonePath, "type"))
		if zoneType == "" {
			zoneType = entry.Name()
		}
		if !isCPUTempSource(zoneType) {
			continue
		}
		raw, err := readInt64(filepath.Join(zonePath, "temp"))
		if err != nil {
			continue
		}
		temps = append(temps, float64(raw)/1000.0)
	}

	return temps
}

func maxFloat64(values []float64) float64 {
	max := values[0]
	for i := 1; i < len(values); i++ {
		if values[i] > max {
			max = values[i]
		}
	}
	return max
}

func readTrimmed(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(data))
}

func readInt64(path string) (int64, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	return strconv.ParseInt(strings.TrimSpace(string(data)), 10, 64)
}

func isCPUTempSource(value string) bool {
	v := strings.ToLower(value)
	keywords := []string{
		"cpu",
		"core",
		"package",
		"pkg",
		"x86_pkg",
		"coretemp",
		"k10temp",
		"tctl",
		"tdie",
	}
	for _, keyword := range keywords {
		if strings.Contains(v, keyword) {
			return true
		}
	}
	return false
}
