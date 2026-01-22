import type { DeviceMetrics, HostMetrics, MetricSample } from './metrics';
import { useMetricsStore } from './metrics';

export const useMetricsHostsStore = defineStore('metricsHosts', () => {
  const metricsStore = useMetricsStore();
  const { hosts } = storeToRefs(metricsStore);

  const hostFor = (name: string | null | undefined): HostMetrics | null => {
    if (!name) {
      return null;
    }
    return hosts.value.find(host => host.host === name) ?? null;
  };

  const deviceFor = (hostName: string | null | undefined, deviceName: string | null | undefined): DeviceMetrics | null => {
    if (!hostName || !deviceName) {
      return null;
    }
    const host = hostFor(hostName);
    if (!host) {
      return null;
    }
    return host.devices.find(device => device.device === deviceName) ?? null;
  };

  const metricFor = (hostName: string | null | undefined, deviceName: string | null | undefined, metricName: string): MetricSample | null => {
    const device = deviceFor(hostName, deviceName);
    if (!device) {
      return null;
    }
    return device.metrics.find(metric => metric.metric === metricName) ?? null;
  };

  const hostWithDevice = (hostName: string | null | undefined, deviceName: string | null | undefined): HostMetrics | null => {
    const host = hostFor(hostName);
    if (!host) {
      return null;
    }
    if (!deviceName) {
      return host;
    }
    const device = deviceFor(hostName, deviceName);
    if (!device) {
      return { ...host, devices: [] };
    }
    return { ...host, devices: [device] };
  };

  const hostsFor = (hostName: string | null | undefined, deviceName?: string | null | undefined): HostMetrics[] => {
    const host = hostWithDevice(hostName, deviceName ?? null);
    return host ? [host] : [];
  };

  const deriveUsage = (hostName: string | null | undefined, deviceName: string) => {
    const usage = metricFor(hostName, deviceName, 'usage');
    if (usage?.value !== null && usage?.value !== undefined) {
      return { value: usage.value, timestamp: usage.timestamp };
    }
    const used = metricFor(hostName, deviceName, 'used');
    const total = metricFor(hostName, deviceName, 'total');
    if (used?.value !== null && total?.value) {
      return { value: ((used?.value ?? 0) / total.value) * 100, timestamp: used?.timestamp || total.timestamp };
    }
    return { value: null, timestamp: null };
  };

  return {
    hostFor,
    deviceFor,
    metricFor,
    hostWithDevice,
    hostsFor,
    deriveUsage,
  };
});
