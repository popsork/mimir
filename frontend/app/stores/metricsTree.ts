type MetricsTreeOverview = {
  hosts: number;
  docker_containers: number;
  container_containers: number;
  total_containers: number;
  docker_running: number;
  container_running: number;
  total_running: number;
};

type MetricsTreeHost = {
  host: string;
  devices: string[];
  docker: { containers: Array<{ name: string; running: boolean | null }> };
  proxmox: { containers: Array<{ name: string; running: boolean | null }> };
};

type MetricsTreeResponse = {
  overview: MetricsTreeOverview;
  hosts: MetricsTreeHost[];
};

export const useMetricsTreeStore = defineStore('metricsTree', () => {
  const overview = ref<MetricsTreeOverview>({
    hosts: 0,
    docker_containers: 0,
    container_containers: 0,
    total_containers: 0,
    docker_running: 0,
    container_running: 0,
    total_running: 0,
  });
  const hosts = ref<MetricsTreeHost[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTree = async () => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/tree') as MetricsTreeResponse;
      overview.value = data.overview;
      hosts.value = data.hosts;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load metrics tree.';
    } finally {
      loading.value = false;
    }
  };

  return {
    overview,
    hosts,
    loading,
    error,
    fetchTree,
  };
});
