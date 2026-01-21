export const useMetricsWindowStore = defineStore('metricsWindow', () => {
  const windowMinutes = ref(60);

  const setWindowMinutes = (value: number) => {
    const normalized = Math.max(1, Math.min(1440, Math.round(value)));
    windowMinutes.value = normalized;
  };

  return {
    windowMinutes,
    setWindowMinutes,
  };
});
