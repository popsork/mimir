export const useLogsFiltersStore = defineStore('logs-filters', () => {
  const levels = ref<string[]>([]);
  const streams = ref<string[]>([]);
  const hosts = ref<string[]>([]);
  const containers = ref<string[]>([]);
  const images = ref<string[]>([]);
  const loggers = ref<string[]>([]);

  const selectedLevels = ref<string[]>([]);
  const selectedStreams = ref<string[]>([]);
  const selectedHosts = ref<string[]>([]);
  const selectedContainers = ref<string[]>([]);
  const selectedImages = ref<string[]>([]);
  const selectedLoggers = ref<string[]>([]);

  const loading = ref(false);

  const load = async () => {
    loading.value = true;
    try {
      const data = await $fetch('/api/logs/filters') as {
        levels?: string[];
        streams?: string[];
        hosts?: string[];
        containers?: string[];
        images?: string[];
        loggers?: string[];
      };
      levels.value = data.levels || [];
      streams.value = data.streams || [];
      hosts.value = data.hosts || [];
      containers.value = data.containers || [];
      images.value = data.images || [];
      loggers.value = data.loggers || [];
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    selectedLevels.value = [];
    selectedStreams.value = [];
    selectedHosts.value = [];
    selectedContainers.value = [];
    selectedImages.value = [];
    selectedLoggers.value = [];
  };

  return {
    levels,
    streams,
    hosts,
    containers,
    images,
    loggers,
    selectedLevels,
    selectedStreams,
    selectedHosts,
    selectedContainers,
    selectedImages,
    selectedLoggers,
    loading,
    load,
    reset,
  };
});
