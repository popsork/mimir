type RefreshHandler = () => void | Promise<void>;

export const useMetricsRefreshStore = defineStore('metricsRefresh', () => {
  const refreshers = ref<RefreshHandler[]>([]);

  const setRefreshers = (handlers: RefreshHandler[]) => {
    refreshers.value = handlers;
  };

  const clearRefreshers = () => {
    refreshers.value = [];
  };

  const refreshActive = async () => {
    const handlers = refreshers.value;
    if (!handlers.length) {
      return;
    }
    await Promise.all(handlers.map(handler => Promise.resolve(handler())));
  };

  return {
    refreshers,
    setRefreshers,
    clearRefreshers,
    refreshActive,
  };
});
