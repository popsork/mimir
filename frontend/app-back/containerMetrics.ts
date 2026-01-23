import { useMetricsWindowStore } from './metricsWindow';

type ContainerMetric = {
  metric: string;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
};

type ContainerMetricsResponse = {
  host: string;
  container: string;
  type: 'docker' | 'proxmox';
  metrics: ContainerMetric[];
};

export const useContainerMetricsStore = defineStore('containerMetrics', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);
  const host = ref<string | null>(null);
  const container = ref<string | null>(null);
  const type = ref<'docker' | 'proxmox' | null>(null);
  const metrics = ref<ContainerMetric[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let requestId = 0;
  let activeController: AbortController | null = null;

  const fetchMetrics = async (params: { host: string; container: string; type: 'docker' | 'proxmox' }) => {
    const currentRequest = ++requestId;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/container', {
        params: {
          host: params.host,
          container: params.container,
          type: params.type,
          minutes: windowMinutes.value,
        },
        signal: controller.signal,
      }) as ContainerMetricsResponse;

      if (currentRequest !== requestId) {
        return;
      }
      host.value = data.host;
      container.value = data.container;
      type.value = data.type;
      metrics.value = data.metrics;
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      error.value = err instanceof Error ? err.message : 'Unable to load container metrics.';
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
    metrics,
    loading,
    error,
    windowMinutes,
    fetchMetrics,
  };
});
