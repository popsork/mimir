//go:build windows && intelmd

#include "mdapi_wrapper.h"

#include <windows.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "common/instrumentation/api/metrics_discovery_api.h"

using namespace MetricsDiscovery;

typedef struct AdapterContext {
    IAdapterLatest*       adapter;
    IMetricsDeviceLatest* metricsDevice;
    IConcurrentGroup_1_13* concurrentGroup;
    IMetricSet_1_13*      metricSet;
    uint32_t              metricsCount;
    uint32_t              informationCount;
    int                   idxTemp;
    int                   idxPower;
    int                   idxVramUsed;
    int                   idxVramTotal;
    int                   idxUsage;
} AdapterContext;

static HMODULE g_mdLib = NULL;
static OpenAdapterGroup_fn g_openAdapterGroup = NULL;
static IAdapterGroupLatest* g_adapterGroup = NULL;
static AdapterContext* g_adapters = NULL;
static uint32_t g_adapterCount = 0;
static bool g_initialized = false;

static bool contains_icase(const char* haystack, const char* needle) {
    if (!haystack || !needle) {
        return false;
    }
    size_t hlen = strlen(haystack);
    size_t nlen = strlen(needle);
    if (nlen == 0 || hlen < nlen) {
        return false;
    }
    for (size_t i = 0; i + nlen <= hlen; ++i) {
        size_t j = 0;
        for (; j < nlen; ++j) {
            char hc = haystack[i + j];
            char nc = needle[j];
            if (hc >= 'A' && hc <= 'Z') hc = (char)(hc - 'A' + 'a');
            if (nc >= 'A' && nc <= 'Z') nc = (char)(nc - 'A' + 'a');
            if (hc != nc) break;
        }
        if (j == nlen) {
            return true;
        }
    }
    return false;
}

static double typed_value_to_double(const TTypedValue_1_0* val) {
    if (!val) return 0.0;
    switch (val->ValueType) {
        case VALUE_TYPE_UINT32: return (double)val->ValueUInt32;
        case VALUE_TYPE_UINT64: return (double)val->ValueUInt64;
        case VALUE_TYPE_FLOAT:  return (double)val->ValueFloat;
        case VALUE_TYPE_BOOL:   return val->ValueBool ? 1.0 : 0.0;
        default: return 0.0;
    }
}

static double apply_unit_scale(double value, const char* units) {
    if (!units) return value;
    if (contains_icase(units, "kb")) return value * 1024.0;
    if (contains_icase(units, "mb")) return value * 1024.0 * 1024.0;
    if (contains_icase(units, "gb")) return value * 1024.0 * 1024.0 * 1024.0;
    return value;
}

static void clear_adapter_context(AdapterContext* ctx) {
    if (!ctx) return;
    ctx->adapter = NULL;
    ctx->metricsDevice = NULL;
    ctx->concurrentGroup = NULL;
    ctx->metricSet = NULL;
    ctx->metricsCount = 0;
    ctx->informationCount = 0;
    ctx->idxTemp = -1;
    ctx->idxPower = -1;
    ctx->idxVramUsed = -1;
    ctx->idxVramTotal = -1;
    ctx->idxUsage = -1;
}

static void pick_metric_indices(IMetricSet_1_13* metricSet, AdapterContext* ctx) {
    if (!metricSet || !ctx) return;
    TMetricSetParams_1_11* setParams = metricSet->GetParams();
    if (!setParams) return;

    ctx->metricsCount = setParams->MetricsCount;
    ctx->informationCount = setParams->InformationCount;

    for (uint32_t i = 0; i < setParams->MetricsCount; ++i) {
        IMetric_1_13* metric = metricSet->GetMetric(i);
        if (!metric) continue;
        TMetricParams_1_13* params = metric->GetParams();
        if (!params) continue;

        const char* name = params->ShortName ? params->ShortName : params->SymbolName;
        const char* units = params->MetricResultUnits;

        if (ctx->idxTemp < 0 && (contains_icase(name, "temp") || contains_icase(name, "temperature")) &&
            (contains_icase(units, "c") || contains_icase(units, "celsius"))) {
            ctx->idxTemp = (int)i;
            continue;
        }

        if (ctx->idxPower < 0 && contains_icase(name, "power") && (contains_icase(units, "w"))) {
            ctx->idxPower = (int)i;
            continue;
        }

        if (ctx->idxUsage < 0 &&
            (contains_icase(name, "gpu") || contains_icase(name, "gt") || contains_icase(name, "eu")) &&
            (contains_icase(name, "util") || contains_icase(name, "busy") || contains_icase(name, "active")) &&
            (contains_icase(units, "%") || contains_icase(units, "percent"))) {
            ctx->idxUsage = (int)i;
            continue;
        }

        if (ctx->idxVramUsed < 0 &&
            (contains_icase(name, "memory") || contains_icase(name, "vram") || contains_icase(name, "local")) &&
            (contains_icase(name, "used") || contains_icase(name, "util")) &&
            (contains_icase(units, "byte") || contains_icase(units, "kb") || contains_icase(units, "mb") || contains_icase(units, "gb"))) {
            ctx->idxVramUsed = (int)i;
            continue;
        }

        if (ctx->idxVramTotal < 0 &&
            (contains_icase(name, "memory") || contains_icase(name, "vram") || contains_icase(name, "local")) &&
            (contains_icase(name, "total") || contains_icase(name, "size") || contains_icase(name, "capacity")) &&
            (contains_icase(units, "byte") || contains_icase(units, "kb") || contains_icase(units, "mb") || contains_icase(units, "gb"))) {
            ctx->idxVramTotal = (int)i;
            continue;
        }
    }
}

static void select_metric_set(IMetricsDeviceLatest* metricsDevice, AdapterContext* ctx) {
    if (!metricsDevice || !ctx) return;
    TMetricsDeviceParams_1_2* mdParams = metricsDevice->GetParams();
    if (!mdParams) return;

    uint32_t bestScore = 0;
    IConcurrentGroup_1_13* bestGroup = NULL;
    IMetricSet_1_13* bestSet = NULL;
    AdapterContext bestCtx = {};
    clear_adapter_context(&bestCtx);

    for (uint32_t i = 0; i < mdParams->ConcurrentGroupsCount; ++i) {
        IConcurrentGroup_1_13* group = metricsDevice->GetConcurrentGroup(i);
        if (!group) continue;
        TConcurrentGroupParams_1_13* groupParams = group->GetParams();
        if (!groupParams) continue;
        if ((groupParams->MeasurementTypeMask & MEASUREMENT_TYPE_SNAPSHOT_IO) == 0) {
            continue;
        }

        for (uint32_t j = 0; j < groupParams->MetricSetsCount; ++j) {
            IMetricSet_1_13* metricSet = group->GetMetricSet(j);
            if (!metricSet) continue;

            AdapterContext candidate = {};
            clear_adapter_context(&candidate);
            pick_metric_indices(metricSet, &candidate);

            uint32_t score = 0;
            if (candidate.idxTemp >= 0) score++;
            if (candidate.idxPower >= 0) score++;
            if (candidate.idxUsage >= 0) score++;
            if (candidate.idxVramUsed >= 0) score++;
            if (candidate.idxVramTotal >= 0) score++;

            if (score > bestScore) {
                bestScore = score;
                bestGroup = group;
                bestSet = metricSet;
                bestCtx = candidate;
                if (bestScore >= 4) {
                    break;
                }
            }
        }
        if (bestScore >= 4) {
            break;
        }
    }

    if (bestSet) {
        ctx->concurrentGroup = bestGroup;
        ctx->metricSet = bestSet;
        ctx->metricsCount = bestCtx.metricsCount;
        ctx->informationCount = bestCtx.informationCount;
        ctx->idxTemp = bestCtx.idxTemp;
        ctx->idxPower = bestCtx.idxPower;
        ctx->idxUsage = bestCtx.idxUsage;
        ctx->idxVramUsed = bestCtx.idxVramUsed;
        ctx->idxVramTotal = bestCtx.idxVramTotal;
    }
}

int mdapi_init(void) {
    if (g_initialized) {
        return 0;
    }
    g_initialized = true;

    g_mdLib = LoadLibraryA("igdmd64.dll");
    if (!g_mdLib) {
        return -1;
    }
    g_openAdapterGroup = (OpenAdapterGroup_fn)GetProcAddress(g_mdLib, "OpenAdapterGroup");
    if (!g_openAdapterGroup) {
        return -1;
    }
    if (g_openAdapterGroup(&g_adapterGroup) != CC_OK || !g_adapterGroup) {
        return -1;
    }

    const TAdapterGroupParams_1_6* params = g_adapterGroup->GetParams();
    if (!params || params->AdapterCount == 0) {
        return -1;
    }
    g_adapterCount = params->AdapterCount;
    g_adapters = (AdapterContext*)calloc(g_adapterCount, sizeof(AdapterContext));
    if (!g_adapters) {
        return -1;
    }
    for (uint32_t i = 0; i < g_adapterCount; ++i) {
        clear_adapter_context(&g_adapters[i]);
        g_adapters[i].adapter = g_adapterGroup->GetAdapter(i);
        if (!g_adapters[i].adapter) {
            continue;
        }
        if (g_adapters[i].adapter->OpenMetricsDevice(&g_adapters[i].metricsDevice) != CC_OK || !g_adapters[i].metricsDevice) {
            continue;
        }
        select_metric_set(g_adapters[i].metricsDevice, &g_adapters[i]);
    }

    return 0;
}

void mdapi_shutdown(void) {
    if (g_adapters) {
        for (uint32_t i = 0; i < g_adapterCount; ++i) {
            if (g_adapters[i].adapter && g_adapters[i].metricsDevice) {
                g_adapters[i].adapter->CloseMetricsDevice(g_adapters[i].metricsDevice);
            }
        }
        free(g_adapters);
        g_adapters = NULL;
    }
    if (g_adapterGroup) {
        g_adapterGroup->Close();
        g_adapterGroup = NULL;
    }
    if (g_mdLib) {
        FreeLibrary(g_mdLib);
        g_mdLib = NULL;
    }
    g_adapterCount = 0;
    g_initialized = false;
}

int mdapi_device_count(void) {
    if (!g_initialized) {
        return -1;
    }
    return (int)g_adapterCount;
}

int mdapi_device_metrics(int index, double* temp, double* power, double* vram_used, double* vram_total, double* usage) {
    if (!g_initialized || index < 0 || (uint32_t)index >= g_adapterCount) {
        return -1;
    }
    AdapterContext* ctx = &g_adapters[index];
    if (!ctx->metricsDevice || !ctx->metricSet || !ctx->concurrentGroup) {
        return -1;
    }

    uint32_t nsTimerPeriod = 0;
    uint32_t oaBufferSize = 0;
    uint32_t pid = GetCurrentProcessId();
    if (ctx->concurrentGroup->OpenIoStream(ctx->metricSet, pid, &nsTimerPeriod, &oaBufferSize) != CC_OK) {
        return -1;
    }

    if (oaBufferSize == 0) {
        TMetricSetParams_1_11* setParams = ctx->metricSet->GetParams();
        if (setParams) {
            oaBufferSize = setParams->RawReportSize;
        }
    }

    if (oaBufferSize == 0) {
        ctx->concurrentGroup->CloseIoStream();
        return -1;
    }

    uint8_t* rawData = (uint8_t*)malloc(oaBufferSize);
    if (!rawData) {
        ctx->concurrentGroup->CloseIoStream();
        return -1;
    }

    ctx->concurrentGroup->WaitForReports(200);
    uint32_t reportCount = 1;
    TCompletionCode readStatus = ctx->concurrentGroup->ReadIoStream(&reportCount, (char*)rawData, IO_READ_FLAG_DROP_OLD_REPORTS);
    ctx->concurrentGroup->CloseIoStream();
    if (readStatus != CC_OK || reportCount == 0) {
        free(rawData);
        return -1;
    }

    uint32_t outCount = ctx->metricsCount + ctx->informationCount;
    if (outCount == 0) {
        free(rawData);
        return -1;
    }
    TTypedValue_1_0* out = (TTypedValue_1_0*)calloc(outCount, sizeof(TTypedValue_1_0));
    if (!out) {
        free(rawData);
        return -1;
    }

    uint32_t outReportCount = 0;
    TCompletionCode calcStatus = ctx->metricSet->CalculateMetrics(rawData, oaBufferSize, out, outCount, &outReportCount, NULL, 0);
    free(rawData);
    if (calcStatus != CC_OK || outReportCount == 0) {
        free(out);
        return -1;
    }

    if (temp && ctx->idxTemp >= 0 && (uint32_t)ctx->idxTemp < ctx->metricsCount) {
        IMetric_1_13* metric = ctx->metricSet->GetMetric((uint32_t)ctx->idxTemp);
        TMetricParams_1_13* params = metric ? metric->GetParams() : NULL;
        *temp = typed_value_to_double(&out[ctx->idxTemp]);
        if (params && params->MetricResultUnits) {
            *temp = apply_unit_scale(*temp, params->MetricResultUnits);
        }
    }
    if (power && ctx->idxPower >= 0 && (uint32_t)ctx->idxPower < ctx->metricsCount) {
        IMetric_1_13* metric = ctx->metricSet->GetMetric((uint32_t)ctx->idxPower);
        TMetricParams_1_13* params = metric ? metric->GetParams() : NULL;
        *power = typed_value_to_double(&out[ctx->idxPower]);
        if (params && params->MetricResultUnits) {
            *power = apply_unit_scale(*power, params->MetricResultUnits);
        }
    }
    if (usage && ctx->idxUsage >= 0 && (uint32_t)ctx->idxUsage < ctx->metricsCount) {
        *usage = typed_value_to_double(&out[ctx->idxUsage]);
    }
    if (vram_used && ctx->idxVramUsed >= 0 && (uint32_t)ctx->idxVramUsed < ctx->metricsCount) {
        IMetric_1_13* metric = ctx->metricSet->GetMetric((uint32_t)ctx->idxVramUsed);
        TMetricParams_1_13* params = metric ? metric->GetParams() : NULL;
        *vram_used = typed_value_to_double(&out[ctx->idxVramUsed]);
        if (params && params->MetricResultUnits) {
            *vram_used = apply_unit_scale(*vram_used, params->MetricResultUnits);
        }
    }
    if (vram_total && ctx->idxVramTotal >= 0 && (uint32_t)ctx->idxVramTotal < ctx->metricsCount) {
        IMetric_1_13* metric = ctx->metricSet->GetMetric((uint32_t)ctx->idxVramTotal);
        TMetricParams_1_13* params = metric ? metric->GetParams() : NULL;
        *vram_total = typed_value_to_double(&out[ctx->idxVramTotal]);
        if (params && params->MetricResultUnits) {
            *vram_total = apply_unit_scale(*vram_total, params->MetricResultUnits);
        }
    }

    free(out);
    return 0;
}
