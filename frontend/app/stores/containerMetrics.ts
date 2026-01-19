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
  const host = ref<string | null>(null);
  const container = ref<string | null>(null);
  const type = ref<'docker' | 'proxmox' | null>(null);
  const metrics = ref<ContainerMetric[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const windowMinutes = ref(60);

  const fetchMetrics = async (params: { host: string; container: string; type: 'docker' | 'proxmox' }) => {
    if (loading.value) {
      return;
    }
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
      }) as ContainerMetricsResponse;

      host.value = data.host;
      container.value = data.container;
      type.value = data.type;
      metrics.value = data.metrics;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load container metrics.';
    } finally {
      loading.value = false;
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
