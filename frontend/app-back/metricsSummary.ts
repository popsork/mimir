import { useMetricsStore } from './metrics';

export const useMetricsSummaryStore = defineStore('metricsSummary', () => {
  const metricsStore = useMetricsStore();
  const { hosts } = storeToRefs(metricsStore);

  const hostCount = computed(() => hosts.value.length);

  const totalMetricCount = computed(() => hosts.value.reduce((sum, host) => {
    return sum + host.devices.reduce((deviceSum, device) => deviceSum + device.metrics.length, 0);
  }, 0));

  const lastUpdated = computed(() => {
    const timestamps = hosts.value.flatMap(host => host.devices.flatMap(device => device.metrics.map(metric => metric.timestamp).filter(Boolean)));
    if (!timestamps.length) {
      return null;
    }
    const latest = timestamps.sort().at(-1);
    return latest ?? null;
  });

  return {
    hostCount,
    totalMetricCount,
    lastUpdated,
  };
});
