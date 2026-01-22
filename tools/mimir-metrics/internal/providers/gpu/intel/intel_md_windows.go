//go:build windows && intelmd

package intel

// #cgo LDFLAGS: -ligdmd64
/*
#include "mdapi_wrapper.h"
*/
import "C"

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"mimir-metrics/internal/metrics"
)

type Provider struct {
	initialized bool
	disabled    bool
	initErr     error
}

func New() *Provider {
	return &Provider{}
}

func (Provider) Name() string {
	return "gpu-intel"
}

func (p *Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	p.init()
	if p.disabled {
		return nil, nil
	}

	count := int(C.mdapi_device_count())
	if count < 0 {
		return nil, errors.New("intel mdapi: device count failed")
	}
	if count == 0 {
		return nil, nil
	}

	now := time.Now()
	out := make([]metrics.Metric, 0, count*5)
	for i := 0; i < count; i++ {
		var tempC C.double
		var powerW C.double
		var vramUsed C.double
		var vramTotal C.double
		var usagePct C.double

		ret := int(C.mdapi_device_metrics(C.int(i), &tempC, &powerW, &vramUsed, &vramTotal, &usagePct))
		if ret != 0 {
			continue
		}

		deviceName := fmt.Sprintf("gpu%d", i)
		appendMetric(&out, deviceName, "temp", float64(tempC), "C", now)
		appendMetric(&out, deviceName, "power", float64(powerW), "W", now)
		appendMetric(&out, deviceName, "vram_used", float64(vramUsed), "bytes", now)
		appendMetric(&out, deviceName, "vram_total", float64(vramTotal), "bytes", now)
		appendMetric(&out, deviceName, "usage", float64(usagePct), "pct", now)
	}

	return out, nil
}

func (p *Provider) init() {
	if p.initialized {
		return
	}
	p.initialized = true

	if ret := int(C.mdapi_init()); ret != 0 {
		p.disabled = true
		p.initErr = errors.New("intel mdapi not available: implement mdapi_wrapper.c with the SDK")
		log.Printf("intel gpu metrics disabled: %v", p.initErr)
		return
	}
}

func appendMetric(out *[]metrics.Metric, device, name string, value float64, unit string, ts time.Time) {
	*out = append(*out, metrics.Metric{
		Device:    device,
		Name:      name,
		Value:     value,
		Unit:      unit,
		Source:    "intel-md",
		Timestamp: ts,
	})
}
