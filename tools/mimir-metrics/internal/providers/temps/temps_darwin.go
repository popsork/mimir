//go:build darwin

package temps

/*
#cgo LDFLAGS: -framework IOKit -framework CoreFoundation
#include <stdlib.h>
#include "smc_darwin.h"
*/
import "C"

import (
	"context"
	"time"
	"unsafe"

	"mimir-metrics/internal/metrics"
)

var defaultSMCKeys = []string{
	"TC0P",
	"TC0E",
	"TC0F",
	"TC0D",
	"TC0H",
	"TC1C",
	"TC2C",
	"TC3C",
	"TC4C",
	"TC5C",
}

type Provider struct {
	keys []string
}

func New() Provider {
	return Provider{keys: defaultSMCKeys}
}

func (Provider) Name() string {
	return "temps"
}

func (p Provider) Collect(ctx context.Context) ([]metrics.Metric, error) {
	_ = ctx
	if len(p.keys) == 0 {
		return nil, nil
	}

	if ret := C.smc_open(); ret != 0 {
		return nil, nil
	}
	defer C.smc_close()

	var maxTemp float64
	var found bool
	for _, key := range p.keys {
		cKey := C.CString(key)
		var temp C.double
		if ret := C.smc_read_temp(cKey, &temp); ret == 0 {
			value := float64(temp)
			if !found || value > maxTemp {
				maxTemp = value
				found = true
			}
		}
		C.free(unsafe.Pointer(cKey))
	}

	if !found {
		return nil, nil
	}

	return []metrics.Metric{
		{
			Device:    "cpu",
			Name:      "temp",
			Value:     maxTemp,
			Unit:      "C",
			Source:    "smc",
			Timestamp: time.Now(),
		},
	}, nil
}
