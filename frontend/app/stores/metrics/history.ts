import { useMetricsWindowStore } from './window';

export type HistoryPoint = {
  timestamp: string | null;
  value: number | null;
};

type HistoryResponse = {
  host: string;
  device: string;
  metric: string;
  minutes: number;
  points: HistoryPoint[];
};

export const useMetricsHistoryStore = defineStore('metricsHistory', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);

  const pointsByKey = ref<Record<string, HistoryPoint[]>>({});
  const loadingByKey = ref<Record<string, boolean>>({});
  const errorByKey = ref<Record<string, string | null>>({});
  const requestIds = new Map<string, number>();
  const controllers = new Map<string, AbortController>();

  const fetchHistory = async (params: { host: string; device: string; metric: string }) => {
    const key = `${params.host}:${params.device}:${params.metric}`;
    const requestId = (requestIds.get(key) ?? 0) + 1;
    requestIds.set(key, requestId);

    controllers.get(key)?.abort();
    const controller = new AbortController();
    controllers.set(key, controller);

    loadingByKey.value = { ...loadingByKey.value, [key]: true };
    errorByKey.value = { ...errorByKey.value, [key]: null };

    try {
      const data = await $fetch('/api/metrics/device-history', {
        params: {
          host: params.host,
          device: params.device,
          metric: params.metric,
          minutes: windowMinutes.value,
        },
        signal: controller.signal,
      }) as HistoryResponse;

      if (requestId !== requestIds.get(key)) {
        return;
      }

      pointsByKey.value = { ...pointsByKey.value, [key]: data.points };
      windowStore.setWindowMinutes(data.minutes);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      errorByKey.value = {
        ...errorByKey.value,
        [key]: err instanceof Error ? err.message : 'Unable to load metric history.',
      };
    } finally {
      if (requestId === requestIds.get(key)) {
        loadingByKey.value = { ...loadingByKey.value, [key]: false };
      }
    }
  };

  const pointsFor = (host: string | null, device: string | null, metric: string | null) => {
    if (!host || !device || !metric) {
      return [];
    }
    return pointsByKey.value[`${host}:${device}:${metric}`] ?? [];
  };

  const loadingFor = (host: string | null, device: string | null, metric: string | null) => {
    if (!host || !device || !metric) {
      return false;
    }
    return loadingByKey.value[`${host}:${device}:${metric}`] ?? false;
  };

  const errorFor = (host: string | null, device: string | null, metric: string | null) => {
    if (!host || !device || !metric) {
      return null;
    }
    return errorByKey.value[`${host}:${device}:${metric}`] ?? null;
  };

  return {
    fetchHistory,
    pointsFor,
    loadingFor,
    errorFor,
  };
});
