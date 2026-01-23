import {useMetricsTickerStore} from "~/stores/metrics/ticker";

type MetricsResponse = {
  window_minutes: number,
  hosts: MetricsHost[],
};

type MetricsHost = {
  host: string,
  devices: MetricsDevice[],
}

type MetricsDevice = {
  device: string,
  metrics: MetricsMetric[],
}

type MetricsMetric = {
  metric: string,
  unit: string,
  value: number,
  timestamp: string,
}

export const useMetricsStore = defineStore("metrics-store", () => {
  const tickerStore = useMetricsTickerStore();
  const data = ref(null as MetricsHost[] | null);

  const refresh = async () => {
    const response = await $fetch('/api/metrics') as MetricsResponse;
    data.value = response.hosts;
  }

  const hosts = computed(() => {
    if (!data.value) {
      return [];
    }

    return data.value.map(d => d.host);
  });

  const getHostDeviceMetric = (host: string, device: string, metric: string) : MetricsMetric | null => {
    if (!data.value) {
      return null;
    }

    const hostMetrics = data.value.find(h => h.host === host);
    if (!hostMetrics) {
      return null;
    }

    const deviceMetric = hostMetrics.devices.find(d => d.device === device);
    if (!deviceMetric) {
      return null;
    }

    return deviceMetric.metrics.find(m => m.metric === metric) ?? null;
  };

  tickerStore.register(() => refresh());

  return {
    hosts,
    data,
    getHostDeviceMetric,
  }
});
