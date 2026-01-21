import { useMetricsWindowStore } from './metricsWindow';

type OverviewMetric = {
  value: number | null;
  timestamp: string | null;
};

type ContainerOverviewItem = {
  name: string;
  status: boolean | null;
  cpu: OverviewMetric | null;
  mem: OverviewMetric | null;
  uptime: OverviewMetric | null;
};

type ContainersOverviewResponse = {
  host: string;
  type: 'docker' | 'proxmox';
  minutes: number;
  total: number;
  running: number;
  items: ContainerOverviewItem[];
};

export const useContainersOverviewStore = defineStore('containersOverview', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);
  const host = ref<string | null>(null);
  const type = ref<'docker' | 'proxmox' | null>(null);
  const total = ref(0);
  const running = ref(0);
  const items = ref<ContainerOverviewItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOverview = async (params: { host: string; type: 'docker' | 'proxmox' }) => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/containers-overview', {
        params: {
          host: params.host,
          type: params.type,
          minutes: windowMinutes.value,
        },
      }) as ContainersOverviewResponse;

      host.value = data.host;
      type.value = data.type;
      windowStore.setWindowMinutes(data.minutes);
      total.value = data.total;
      running.value = data.running;
      items.value = data.items;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load container overview.';
    } finally {
      loading.value = false;
    }
  };

  return {
    host,
    type,
    windowMinutes,
    total,
    running,
    items,
    loading,
    error,
    fetchOverview,
  };
});
