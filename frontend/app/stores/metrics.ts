import { useMetricsWindowStore } from './metricsWindow';

export type MetricDefinition = {
  metric: string;
  label: string;
  unit?: string;
};

export type DeviceDefinition = {
  device: string;
  label: string;
  metrics: MetricDefinition[];
};

export type MetricSample = {
  label: string;
  metric: string;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
};

export type DeviceMetrics = {
  device: string;
  label: string;
  metrics: MetricSample[];
};

export type HostMetrics = {
  host: string | null;
  devices: DeviceMetrics[];
};

export type MetricsResponse = {
  hosts: Array<{
    host: string | null;
    devices: Array<{
      device: string | null;
      metrics: Array<{
        metric: string;
        unit: string | null;
        value: number;
        timestamp: string | null;
      }>;
    }>;
  }>;
  window_minutes: number;
};

export const useMetricsStore = defineStore('metrics', () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);
  const definitions: DeviceDefinition[] = [
    {
      device: 'cpu',
      label: 'CPU',
      metrics: [
        { metric: 'usage', label: 'Usage', unit: 'pct' },
        { metric: 'temp', label: 'Temperature', unit: 'C' },
      ],
    },
    {
      device: 'gpu0',
      label: 'GPU 0',
      metrics: [
        { metric: 'usage', label: 'Usage', unit: 'pct' },
        { metric: 'power', label: 'Power', unit: 'W' },
        { metric: 'temp', label: 'Temperature', unit: 'C' },
      ],
    },
    {
      device: 'mem',
      label: 'Memory',
      metrics: [
        { metric: 'usage', label: 'Usage', unit: 'pct' },
        { metric: 'used', label: 'Used', unit: 'bytes' },
        { metric: 'total', label: 'Total', unit: 'bytes' },
      ],
    },
    {
      device: 'system',
      label: 'System',
      metrics: [
        { metric: 'load1', label: 'Load 1m', unit: 'load' },
        { metric: 'load5', label: 'Load 5m', unit: 'load' },
        { metric: 'load15', label: 'Load 15m', unit: 'load' },
        { metric: 'uptime', label: 'Uptime', unit: 'seconds' },
        { metric: 'boot_time', label: 'Boot Time', unit: 'unix_seconds' },
        { metric: 'processes', label: 'Processes', unit: 'count' },
      ],
    },
    {
      device: 'disk',
      label: 'Disk',
      metrics: [
        { metric: 'usage', label: 'Usage', unit: 'pct' },
        { metric: 'used', label: 'Used', unit: 'bytes' },
        { metric: 'total', label: 'Total', unit: 'bytes' },
      ],
    },
    {
      device: 'diskio',
      label: 'Disk IO',
      metrics: [
        { metric: 'read_bytes', label: 'Read', unit: 'bytes' },
        { metric: 'write_bytes', label: 'Write', unit: 'bytes' },
        { metric: 'read_ops', label: 'Read Ops', unit: 'ops' },
        { metric: 'write_ops', label: 'Write Ops', unit: 'ops' },
        { metric: 'read_time_ms', label: 'Read Time', unit: 'ms' },
        { metric: 'write_time_ms', label: 'Write Time', unit: 'ms' },
        { metric: 'io_time_ms', label: 'IO Time', unit: 'ms' },
      ],
    },
    {
      device: 'net',
      label: 'Network',
      metrics: [
        { metric: 'bytes_in', label: 'Bytes In', unit: 'bytes' },
        { metric: 'bytes_out', label: 'Bytes Out', unit: 'bytes' },
        { metric: 'packets_in', label: 'Packets In', unit: 'packets' },
        { metric: 'packets_out', label: 'Packets Out', unit: 'packets' },
        { metric: 'errors_in', label: 'Errors In', unit: 'count' },
        { metric: 'errors_out', label: 'Errors Out', unit: 'count' },
        { metric: 'drops_in', label: 'Drops In', unit: 'count' },
        { metric: 'drops_out', label: 'Drops Out', unit: 'count' },
      ],
    },
    {
      device: 'swap',
      label: 'Swap',
      metrics: [
        { metric: 'usage', label: 'Usage', unit: 'pct' },
        { metric: 'used', label: 'Used', unit: 'bytes' },
        { metric: 'total', label: 'Total', unit: 'bytes' },
      ],
    },
    {
      device: 'fan',
      label: 'Fan',
      metrics: [
        { metric: 'rpm', label: 'Speed', unit: 'rpm' },
      ],
    },
  ];

  const hosts = ref<HostMetrics[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const normalizedHosts = (data: MetricsResponse) => {
    const hostRows = data.hosts || [];
    const byHost = new Map<string, HostMetrics>();

    for (const hostEntry of hostRows) {
      const hostName = hostEntry.host || 'unknown';
      byHost.set(hostName, {
        host: hostName,
        devices: [],
      });
    }

    const sortedHostNames = Array.from(byHost.keys()).sort((a, b) => a.localeCompare(b));

    return sortedHostNames.map((hostName) => {
      const hostEntry = hostRows.find(row => (row.host || 'unknown') === hostName);
      const devices: DeviceMetrics[] = definitions.map((deviceDef) => {
        const deviceData = hostEntry?.devices.find(entry => entry.device === deviceDef.device);
        const metrics = deviceDef.metrics.map((metricDef) => {
          const found = deviceData?.metrics.find(metric => metric.metric === metricDef.metric);
          return {
            label: metricDef.label,
            metric: metricDef.metric,
            unit: found?.unit ?? metricDef.unit ?? null,
            value: typeof found?.value === 'number' ? found?.value : null,
            timestamp: found?.timestamp ?? null,
          };
        });

        return {
          device: deviceDef.device,
          label: deviceDef.label,
          metrics,
        };
      });

      return {
        host: hostName,
        devices,
      };
    });
  };

  const fetchMetrics = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics', {
        params: { minutes: windowMinutes.value }
      }) as MetricsResponse;
      hosts.value = normalizedHosts(data);
      windowStore.setWindowMinutes(data.window_minutes || windowMinutes.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load metrics.';
    } finally {
      loading.value = false;
    }
  };

  return {
    definitions,
    hosts,
    loading,
    error,
    windowMinutes,
    fetchMetrics,
  };
});
