//go:build linux

package nvidia

import (
	"context"
	"fmt"
	"time"

	"github.com/NVIDIA/go-nvml/pkg/nvml"

	"mimir-metrics/internal/metrics"
)

type Provider struct {
	disabled bool
}

func New() *Provider {
	return &Provider{}
}

func (Provider) Name() string {
	return "gpu-nvidia"
}

func (p *Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	if p.disabled {
		return nil, nil
	}

	ret := nvml.Init()
	if ret != nvml.SUCCESS {
		if ret == nvml.ERROR_LIBRARY_NOT_FOUND || ret == nvml.ERROR_DRIVER_NOT_LOADED || ret == nvml.ERROR_NO_PERMISSION || ret == nvml.ERROR_NOT_SUPPORTED || ret == nvml.ERROR_UNKNOWN {
			p.disabled = true
			return nil, nil
		}
		return nil, fmt.Errorf("nvml init failed: %s", nvml.ErrorString(ret))
	}
	defer nvml.Shutdown()

	count, ret := nvml.DeviceGetCount()
	if ret != nvml.SUCCESS {
		if ret == nvml.ERROR_NOT_SUPPORTED || ret == nvml.ERROR_UNKNOWN {
			p.disabled = true
			return nil, nil
		}
		return nil, fmt.Errorf("nvml device count failed: %s", nvml.ErrorString(ret))
	}

	now := time.Now()
	metricsOut := make([]metrics.Metric, 0, count*4)
	for i := 0; i < count; i++ {
		device, ret := nvml.DeviceGetHandleByIndex(i)
		if ret != nvml.SUCCESS {
			continue
		}

		deviceName := fmt.Sprintf("gpu%d", i)
		appendNVMLMetrics(&metricsOut, device, deviceName, now)
	}

	return metricsOut, nil
}

func appendNVMLMetrics(out *[]metrics.Metric, device nvml.Device, deviceName string, now time.Time) {
	if temp, ret := device.GetTemperature(nvml.TEMPERATURE_GPU); ret == nvml.SUCCESS {
		*out = append(*out, metrics.Metric{
			Device:    deviceName,
			Name:      "temp",
			Value:     float64(temp),
			Unit:      "C",
			Source:    "nvml",
			Timestamp: now,
		})
	}

	if power, ret := device.GetPowerUsage(); ret == nvml.SUCCESS {
		*out = append(*out, metrics.Metric{
			Device:    deviceName,
			Name:      "power",
			Value:     float64(power) / 1000.0,
			Unit:      "W",
			Source:    "nvml",
			Timestamp: now,
		})
	}

	if util, ret := device.GetUtilizationRates(); ret == nvml.SUCCESS {
		*out = append(*out, metrics.Metric{
			Device:    deviceName,
			Name:      "usage",
			Value:     float64(util.Gpu),
			Unit:      "pct",
			Source:    "nvml",
			Timestamp: now,
		})
	}

	if mem, ret := device.GetMemoryInfo(); ret == nvml.SUCCESS {
		*out = append(*out, metrics.Metric{
			Device:    deviceName,
			Name:      "vram_used",
			Value:     float64(mem.Used),
			Unit:      "bytes",
			Source:    "nvml",
			Timestamp: now,
		})
		*out = append(*out, metrics.Metric{
			Device:    deviceName,
			Name:      "vram_total",
			Value:     float64(mem.Total),
			Unit:      "bytes",
			Source:    "nvml",
			Timestamp: now,
		})
	}
}
