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

  const shouldApplyFilter = (selected: string[], all: string[]) => {
    if (selected.length === 0) return false;
    if (all.length === 0) return false;
    return selected.length < all.length;
  };

  const buildParams = () => {
    const params: Record<string, string | string[] | number> = {};

    const normalizeDateParam = (value: string | null) => {
      if (!value) return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return value;
      }
      return parsed.toISOString();
    };

    if (query.value.trim() !== '') {
      params.q = query.value.trim();
    }
    if (from.value) {
      params.from = normalizeDateParam(from.value) ?? from.value;
    }
    if (to.value) {
      params.to = normalizeDateParam(to.value) ?? to.value;
    }

    if (shouldApplyFilter(filtersStore.selectedLevels, filtersStore.levels)) {
      params.levels = filtersStore.selectedLevels;
    }
    if (shouldApplyFilter(filtersStore.selectedStreams, filtersStore.streams)) {
      params.streams = filtersStore.selectedStreams;
    }
    if (shouldApplyFilter(filtersStore.selectedWorkloads, filtersStore.workloads)) {
      params.workloads = filtersStore.selectedWorkloads;
    }
    if (shouldApplyFilter(filtersStore.selectedHosts, filtersStore.hosts)) {
      params.hosts = filtersStore.selectedHosts;
    }
    if (shouldApplyFilter(filtersStore.selectedContainers, filtersStore.containers)) {
      params.containers = filtersStore.selectedContainers;
    }
    if (shouldApplyFilter(filtersStore.selectedImages, filtersStore.images)) {
      params.images = filtersStore.selectedImages;
    }
    if (shouldApplyFilter(filtersStore.selectedIdentifiers, filtersStore.identifiers)) {
      params.identifiers = filtersStore.selectedIdentifiers;
    }
    if (shouldApplyFilter(filtersStore.selectedLoggers, filtersStore.loggers)) {
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
