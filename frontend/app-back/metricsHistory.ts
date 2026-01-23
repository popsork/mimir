import { useMetricsWindowStore } from './metricsWindow';

type HistoryPoint = {
  timestamp: string | null;
  value: number | null;
};

type DeviceHistoryResponse = {
  host: string;
  device: string;
  metric: string;
  minutes: number;
  points: HistoryPoint[];
};

export const useMetricsHistoryStore = defineStore('metricsHistory', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);
  const host = ref<string | null>(null);
  const device = ref<string | null>(null);
  const metric = ref<string | null>(null);
  const points = ref<HistoryPoint[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let requestId = 0;
  let activeController: AbortController | null = null;

  const fetchHistory = async (params: { host: string; device: string; metric: string }) => {
    const currentRequest = ++requestId;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/device-history', {
        params: {
          host: params.host,
          device: params.device,
          metric: params.metric,
          minutes: windowMinutes.value,
        },
        signal: controller.signal,
      }) as DeviceHistoryResponse;

      if (currentRequest !== requestId) {
        return;
      }
      host.value = data.host;
      device.value = data.device;
      metric.value = data.metric;
      points.value = data.points;
      windowStore.setWindowMinutes(data.minutes);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      error.value = err instanceof Error ? err.message : 'Unable to load metric history.';
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  return {
    host,
    device,
    metric,
    points,
    loading,
    error,
    windowMinutes,
    fetchHistory,
  };
});
