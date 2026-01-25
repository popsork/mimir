export const useMetricsWindowStore = defineStore('metricsWindow', () => {
  const windowMinutes = ref(60);

  const setWindowMinutes = (value: number) => {
    const normalized = Math.max(1, Math.min(1440, Math.round(value)));
    if (windowMinutes.value === normalized) {
      return;
    }
    windowMinutes.value = normalized;
  };

  return {
    windowMinutes,
    setWindowMinutes,
  };
});
