import { useMetricsWindowStore } from '../metrics/window';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

type ContainerHistoryResponse = {
  host: string;
  container: string;
  type: 'docker' | 'proxmox';
  minutes: number;
  series: Array<{
    metric: string;
    points: SeriesPoint[];
  }>;
};

export const useContainerHistoryStore = defineStore('containerHistory', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);

  const host = ref<string | null>(null);
  const container = ref<string | null>(null);
  const type = ref<'docker' | 'proxmox' | null>(null);
  const series = ref<Record<string, SeriesPoint[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  let requestId = 0;
  let activeController: AbortController | null = null;

  const fetchHistory = async (params: { host: string; container: string; type: 'docker' | 'proxmox'; metrics: string[] }) => {
    const currentRequest = ++requestId;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/container-history', {
        params: {
          host: params.host,
          container: params.container,
          type: params.type,
          metrics: params.metrics.join(','),
          minutes: windowMinutes.value,
        },
        signal: controller.signal,
      }) as ContainerHistoryResponse;

      if (currentRequest !== requestId) {
        return;
      }

      host.value = data.host;
      container.value = data.container;
      type.value = data.type;
      series.value = Object.fromEntries(data.series.map(entry => [entry.metric, entry.points]));
      windowStore.setWindowMinutes(data.minutes);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      error.value = err instanceof Error ? err.message : 'Unable to load container history.';
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  return {
    host,
    container,
    type,
    series,
    loading,
    error,
    fetchHistory,
  };
});
