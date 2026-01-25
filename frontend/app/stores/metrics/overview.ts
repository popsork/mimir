import { useMetricsWindowStore } from './window';

type OverviewMetric = {
  value: number | null;
  timestamp: string | null;
};

type OverviewItem = {
  id: string;
  label: string;
  type: 'machine' | 'proxmox';
  cpu: OverviewMetric | null;
  mem: OverviewMetric | null;
  disk: OverviewMetric | null;
};

type OverviewResponse = {
  minutes: number;
  items: OverviewItem[];
};

export const useMetricsOverviewStore = defineStore('metricsOverview', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);
  const items = ref<OverviewItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const cpuRows = computed(() => items.value.map(item => ({
    id: item.id,
    label: item.label,
    value: item.cpu?.value ?? null,
    timestamp: item.cpu?.timestamp ?? null,
  })));

  const memoryRows = computed(() => items.value.map(item => ({
    id: item.id,
    label: item.label,
    value: item.mem?.value ?? null,
    timestamp: item.mem?.timestamp ?? null,
  })));

  const diskRows = computed(() => items.value.map(item => ({
    id: item.id,
    label: item.label,
    value: item.disk?.value ?? null,
    timestamp: item.disk?.timestamp ?? null,
  })));

  const fetchOverview = async () => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/overview', {
        params: {
          minutes: windowMinutes.value,
        },
      }) as OverviewResponse;

      items.value = data.items;
      windowStore.setWindowMinutes(data.minutes);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load overview metrics.';
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    cpuRows,
    memoryRows,
    diskRows,
    windowMinutes,
    fetchOverview,
  };
});
