import { useMetricsWindowStore } from './metricsWindow';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

type DeviceSeriesResponse = {
  host: string;
  device: string;
  minutes: number;
  series: Array<{
    metric: string;
    points: SeriesPoint[];
  }>;
};

export const useMetricsDeviceSeriesStore = defineStore('metricsDeviceSeries', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);

  const seriesByKey = ref<Record<string, Record<string, SeriesPoint[]>>>({});
  const loadingByKey = ref<Record<string, boolean>>({});
  const errorByKey = ref<Record<string, string | null>>({});
  const requestIds = new Map<string, number>();
  const controllers = new Map<string, AbortController>();

  const fetchSeries = async (params: { host: string; device: string; metrics: string[] }) => {
    const key = `${params.host}:${params.device}`;
    const requestId = (requestIds.get(key) ?? 0) + 1;
    requestIds.set(key, requestId);

    controllers.get(key)?.abort();
    const controller = new AbortController();
    controllers.set(key, controller);

    loadingByKey.value = { ...loadingByKey.value, [key]: true };
    errorByKey.value = { ...errorByKey.value, [key]: null };

    try {
      const data = await $fetch('/api/metrics/device-series', {
        params: {
          host: params.host,
          device: params.device,
          metrics: params.metrics.join(','),
          minutes: windowMinutes.value,
        },
        signal: controller.signal,
      }) as DeviceSeriesResponse;

      if (requestId !== requestIds.get(key)) {
        return;
      }

      const seriesMap: Record<string, SeriesPoint[]> = {};
      for (const entry of data.series) {
        seriesMap[entry.metric] = entry.points;
      }
      seriesByKey.value = { ...seriesByKey.value, [key]: seriesMap };
      windowStore.setWindowMinutes(data.minutes);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      errorByKey.value = {
        ...errorByKey.value,
        [key]: err instanceof Error ? err.message : 'Unable to load metric series.',
      };
    } finally {
      if (requestId === requestIds.get(key)) {
        loadingByKey.value = { ...loadingByKey.value, [key]: false };
      }
    }
  };

  const seriesFor = (host: string | null, device: string | null) => {
    if (!host || !device) {
      return {};
    }
    return seriesByKey.value[`${host}:${device}`] ?? {};
  };

  const loadingFor = (host: string | null, device: string | null) => {
    if (!host || !device) {
      return false;
    }
    return loadingByKey.value[`${host}:${device}`] ?? false;
  };

  const errorFor = (host: string | null, device: string | null) => {
    if (!host || !device) {
      return null;
    }
    return errorByKey.value[`${host}:${device}`] ?? null;
  };

  return {
    fetchSeries,
    seriesFor,
    loadingFor,
    errorFor,
  };
});
