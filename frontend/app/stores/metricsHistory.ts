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
  const host = ref<string | null>(null);
  const device = ref<string | null>(null);
  const metric = ref<string | null>(null);
  const points = ref<HistoryPoint[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const windowMinutes = ref(120);

  const fetchHistory = async (params: { host: string; device: string; metric: string }) => {
    if (loading.value) {
      return;
    }
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
      }) as DeviceHistoryResponse;

      host.value = data.host;
      device.value = data.device;
      metric.value = data.metric;
      points.value = data.points;
      windowMinutes.value = data.minutes;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load metric history.';
    } finally {
      loading.value = false;
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
