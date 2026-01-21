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

  const load = async () => {
    loading.value = true;
    try {
      const data = await $fetch('/api/logs/filters') as {
        levels?: string[];
        streams?: string[];
        workloads?: string[];
        hosts?: string[];
        containers?: string[];
        images?: string[];
        identifiers?: string[];
        loggers?: string[];
      };
      levels.value = data.levels || [];
      streams.value = data.streams || [];
      workloads.value = data.workloads || [];
      hosts.value = data.hosts || [];
      containers.value = data.containers || [];
      images.value = data.images || [];
      identifiers.value = data.identifiers || [];
      loggers.value = data.loggers || [];

      if (selectedLevels.value.length === 0) selectedLevels.value = [...levels.value];
      if (selectedStreams.value.length === 0) selectedStreams.value = [...streams.value];
      if (selectedWorkloads.value.length === 0) selectedWorkloads.value = [...workloads.value];
      if (selectedHosts.value.length === 0) selectedHosts.value = [...hosts.value];
      if (selectedContainers.value.length === 0) selectedContainers.value = [...containers.value];
      if (selectedImages.value.length === 0) selectedImages.value = [...images.value];
      if (selectedIdentifiers.value.length === 0) selectedIdentifiers.value = [...identifiers.value];
      if (selectedLoggers.value.length === 0) selectedLoggers.value = [...loggers.value];
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
