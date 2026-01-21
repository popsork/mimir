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
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    selectedLevels.value = [];
    selectedStreams.value = [];
    selectedWorkloads.value = [];
    selectedHosts.value = [];
    selectedContainers.value = [];
    selectedImages.value = [];
    selectedIdentifiers.value = [];
    selectedLoggers.value = [];
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
