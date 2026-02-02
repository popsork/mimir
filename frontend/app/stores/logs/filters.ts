import { resolveLogsTimeRangePreset } from '../../utils/logsTimeRangePresets';

export const useLogsFiltersStore = defineStore('logs-filters', () => {
  const levels = ref<string[]>([]);
  const streams = ref<string[]>([]);
  const workloads = ref<string[]>([]);
  const hosts = ref<string[]>([]);
  const containers = ref<string[]>([]);
  const images = ref<string[]>([]);
  const identifiers = ref<string[]>([]);
  const loggers = ref<string[]>([]);

  const selectedLevels = ref<string[]>([]);
  const selectedStreams = ref<string[]>([]);
  const selectedWorkloads = ref<string[]>([]);
  const selectedHosts = ref<string[]>([]);
  const selectedContainers = ref<string[]>([]);
  const selectedImages = ref<string[]>([]);
  const selectedIdentifiers = ref<string[]>([]);
  const selectedLoggers = ref<string[]>([]);

  const loading = ref(false);

  const load = async (params?: { from?: string | null; to?: string | null; rangePreset?: string | null }) => {
    loading.value = true;
    try {
      const normalizeDateParam = (value: string | null | undefined) => {
        if (!value) return null;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          return value;
        }
        return parsed.toISOString();
      };

      const requestParams: Record<string, string> = {};
      const presetRange = resolveLogsTimeRangePreset(params?.rangePreset ?? null);
      if (presetRange) {
        requestParams.from = presetRange.from.toISOString();
        requestParams.to = presetRange.to.toISOString();
      } else {
        const normalizedFrom = normalizeDateParam(params?.from);
        const normalizedTo = normalizeDateParam(params?.to);
        if (normalizedFrom) requestParams.from = normalizedFrom;
        if (normalizedTo) requestParams.to = normalizedTo;
      }

      const data = await $fetch('/api/logs/filters', {
        params: requestParams,
      }) as {
        levels?: string[];
        streams?: string[];
        workloads?: string[];
        hosts?: string[];
        containers?: string[];
        images?: string[];
        identifiers?: string[];
        loggers?: string[];
      };
      const nextLevels = data.levels || [];
      const nextStreams = data.streams || [];
      const nextWorkloads = data.workloads || [];
      const nextHosts = data.hosts || [];
      const nextContainers = data.containers || [];
      const nextImages = data.images || [];
      const nextIdentifiers = data.identifiers || [];
      const nextLoggers = data.loggers || [];

      const reconcileSelection = (selected: string[], options: string[]) => {
        if (options.length === 0) return [];
        if (selected.length === 0) return [...options];
        const next = selected.filter((item) => options.includes(item));
        return next.length > 0 ? next : [...options];
      };

      levels.value = nextLevels;
      streams.value = nextStreams;
      workloads.value = nextWorkloads;
      hosts.value = nextHosts;
      containers.value = nextContainers;
      images.value = nextImages;
      identifiers.value = nextIdentifiers;
      loggers.value = nextLoggers;

      selectedLevels.value = reconcileSelection(selectedLevels.value, nextLevels);
      selectedStreams.value = reconcileSelection(selectedStreams.value, nextStreams);
      selectedWorkloads.value = reconcileSelection(selectedWorkloads.value, nextWorkloads);
      selectedHosts.value = reconcileSelection(selectedHosts.value, nextHosts);
      selectedContainers.value = reconcileSelection(selectedContainers.value, nextContainers);
      selectedImages.value = reconcileSelection(selectedImages.value, nextImages);
      selectedIdentifiers.value = reconcileSelection(selectedIdentifiers.value, nextIdentifiers);
      selectedLoggers.value = reconcileSelection(selectedLoggers.value, nextLoggers);
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    selectedLevels.value = [...levels.value];
    selectedStreams.value = [...streams.value];
    selectedWorkloads.value = [...workloads.value];
    selectedHosts.value = [...hosts.value];
    selectedContainers.value = [...containers.value];
    selectedImages.value = [...images.value];
    selectedIdentifiers.value = [...identifiers.value];
    selectedLoggers.value = [...loggers.value];
  };

  return {
    levels,
    streams,
    workloads,
    hosts,
    containers,
    images,
    identifiers,
    loggers,
    selectedLevels,
    selectedStreams,
    selectedWorkloads,
    selectedHosts,
    selectedContainers,
    selectedImages,
    selectedIdentifiers,
    selectedLoggers,
    loading,
    load,
    reset,
  };
});
