import { useLogsFiltersStore } from './filters';

type LogRecord = {
  id: string;
  timestamp: string | null;
  level?: string | null;
  message: string;
  stream?: string | null;
  logger?: string | null;
  trace_id?: string | null;
  request_id?: string | null;
  workload?: string | null;
  host?: string | null;
  container?: string | null;
  image?: string | null;
  identifier?: string | null;
};

export const useLogsStore = defineStore('logs', () => {
  const records = ref<LogRecord[]>([]);
  const loading = ref(false);
  const query = ref('');
  const from = ref<string | null>(null);
  const to = ref<string | null>(null);
  const limit = ref(200);

  const filtersStore = useLogsFiltersStore();

  const buildParams = () => {
    const params: Record<string, string | string[] | number> = {};

    if (query.value.trim() !== '') {
      params.q = query.value.trim();
    }
    if (from.value) {
      params.from = from.value;
    }
    if (to.value) {
      params.to = to.value;
    }

    if (filtersStore.selectedLevels.length) {
      params.levels = filtersStore.selectedLevels;
    }
    if (filtersStore.selectedStreams.length) {
      params.streams = filtersStore.selectedStreams;
    }
    if (filtersStore.selectedWorkloads.length) {
      params.workloads = filtersStore.selectedWorkloads;
    }
    if (filtersStore.selectedHosts.length) {
      params.hosts = filtersStore.selectedHosts;
    }
    if (filtersStore.selectedContainers.length) {
      params.containers = filtersStore.selectedContainers;
    }
    if (filtersStore.selectedImages.length) {
      params.images = filtersStore.selectedImages;
    }
    if (filtersStore.selectedIdentifiers.length) {
      params.identifiers = filtersStore.selectedIdentifiers;
    }
    if (filtersStore.selectedLoggers.length) {
      params.loggers = filtersStore.selectedLoggers;
    }

    params.limit = limit.value;

    return params;
  };

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const data = await $fetch('/api/logs', {
        params: buildParams()
      }) as { data: LogRecord[] };
      records.value = data.data || [];
    } finally {
      loading.value = false;
    }
  };

  return {
    records,
    loading,
    query,
    from,
    to,
    limit,
    fetchLogs,
  };
});
