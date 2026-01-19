<script setup lang="ts">
import { useMetricsStore } from '../../stores/metrics';
import { useMetricsTreeStore } from '../../stores/metricsTree';
import { useContainerMetricsStore } from '../../stores/containerMetrics';
import { useMetricsHistoryStore } from '../../stores/metricsHistory';
import { useMetricsOverviewStore } from '../../stores/metricsOverview';
import { useContainersOverviewStore } from '../../stores/containersOverview';

type TreeNode = {
  label: string;
  value: string;
  status?: 'running' | 'stopped' | null;
  icon?: string;
  ui?: {
    linkLeadingIcon?: string;
  };
  children?: TreeNode[];
};

const metricsStore = useMetricsStore();
const treeStore = useMetricsTreeStore();
const containerStore = useContainerMetricsStore();
const historyStore = useMetricsHistoryStore();
const overviewStore = useMetricsOverviewStore();
const containersOverviewStore = useContainersOverviewStore();
const { hosts, loading, error, windowMinutes } = storeToRefs(metricsStore);
const { overview, hosts: treeHosts } = storeToRefs(treeStore);
const { metrics: containerMetrics, host: containerHost, container: containerName, type: containerType, loading: containerLoading, error: containerError } = storeToRefs(containerStore);
const { points: historyPoints, host: historyHost, device: historyDevice, loading: historyLoading, error: historyError } = storeToRefs(historyStore);
const { items: overviewItems } = storeToRefs(overviewStore);
const {
  host: containersHost,
  type: containersType,
  total: containersTotal,
  running: containersRunning,
  items: containersItems,
  loading: containersLoading,
  error: containersError,
} = storeToRefs(containersOverviewStore);
const route = useRoute();
const router = useRouter();
const hasLoaded = ref(false);
const autoRefresh = ref(true);
const refreshMs = 5000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const selected = ref<TreeNode | undefined>(undefined);

const fetchMetrics = async () => {
  await metricsStore.fetchMetrics();
  hasLoaded.value = true;
};

const fetchTree = async () => {
  await treeStore.fetchTree();
};

const deviceLabelMap = computed(() => {
  const map = new Map<string, string>();
  for (const definition of metricsStore.definitions) {
    map.set(definition.device, definition.label);
  }
  return map;
});

const formatDeviceLabel = (device: string) => {
  const label = deviceLabelMap.value.get(device);
  if (label) {
    return label;
  }
  return device.replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const statusFromRunning = (running: boolean | null) => {
  if (running === true) {
    return 'running';
  }
  if (running === false) {
    return 'stopped';
  }
  return null;
};

const statusIcon = (status: TreeNode['status']) => {
  if (!status) {
    return undefined;
  }
  return 'i-lucide-circle';
};

const statusIconClass = (status: TreeNode['status']) => {
  if (status === 'running') {
    return 'text-emerald-500';
  }
  if (status === 'stopped') {
    return 'text-rose-500';
  }
  return undefined;
};

const treeItems = computed<TreeNode[]>(() => {
  const items: TreeNode[] = [
    { label: 'Overview', value: 'overview', icon: 'i-lucide-layout-dashboard' }
  ];

  for (const host of treeHosts.value) {
    const children: TreeNode[] = [];

    for (const device of host.devices) {
      const iconMap: Record<string, string> = {
        cpu: 'i-lucide-cpu',
        gpu0: 'i-lucide-gpu',
        mem: 'i-lucide-memory-stick',
        system: 'i-lucide-server',
        disk: 'i-lucide-hard-drive',
        diskio: 'i-lucide-activity',
        net: 'i-lucide-wifi',
        swap: 'i-lucide-layers',
        fan: 'i-lucide-fan',
      };
      children.push({
        label: formatDeviceLabel(device),
        value: `device:${host.host}:${device}`,
        icon: iconMap[device] || 'i-lucide-activity'
      });
    }

    if (host.docker.containers.length) {
      children.push({
        label: 'Docker',
        value: `docker:${host.host}`,
        icon: 'i-lucide-box',
        children: host.docker.containers.map(container => {
          const status = statusFromRunning(container.running);
          return {
            label: container.name,
            value: `docker-container:${host.host}:${container.name}`,
            status,
            icon: statusIcon(status),
            ui: statusIconClass(status) ? { linkLeadingIcon: statusIconClass(status) } : undefined,
          };
        })
      });
    }

    if (host.proxmox.containers.length) {
      children.push({
        label: 'Proxmox',
        value: `proxmox:${host.host}`,
        icon: 'i-lucide-boxes',
        children: host.proxmox.containers.map(container => {
          const status = statusFromRunning(container.running);
          return {
            label: container.name,
            value: `proxmox-container:${host.host}:${container.name}`,
            status,
            icon: statusIcon(status),
            ui: statusIconClass(status) ? { linkLeadingIcon: statusIconClass(status) } : undefined,
          };
        })
      });
    }

    items.push({
      label: host.host,
      value: `host:${host.host}`,
      icon: 'i-lucide-server',
      children
    });
  }

  return items;
});

const selectedValue = computed(() => selected.value?.value ?? 'overview');

const findNodeByValue = (nodes: TreeNode[], value: string): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.value === value) {
      return node;
    }
    if (node.children) {
      const found = findNodeByValue(node.children, value);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const viewMode = computed(() => {
  if (selectedValue.value.startsWith('device:')) {
    return 'device';
  }
  if (selectedValue.value.startsWith('host:')) {
    return 'host';
  }
  if (selectedValue.value.startsWith('docker:') || selectedValue.value.startsWith('docker-container:')) {
    return 'docker';
  }
  if (selectedValue.value.startsWith('proxmox:') || selectedValue.value.startsWith('proxmox-container:')) {
    return 'proxmox';
  }
  return 'overview';
});

const selectedHost = computed(() => {
  const parts = selectedValue.value.split(':');
  if (parts.length >= 2) {
    return parts[1];
  }
  return null;
});

const selectedDevice = computed(() => {
  const parts = selectedValue.value.split(':');
  if (parts[0] === 'device' && parts.length >= 3) {
    return parts[2];
  }
  return null;
});

const selectedContainer = computed(() => {
  const parts = selectedValue.value.split(':');
  if (parts[0] === 'docker-container' || parts[0] === 'proxmox-container') {
    const host = parts[1];
    const name = parts[2];
    if (!host || !name) {
      return null;
    }
    return {
      type: (parts[0] === 'docker-container' ? 'docker' : 'proxmox') as 'docker' | 'proxmox',
      host,
      name,
    };
  }
  return null;
});

const viewHosts = computed(() => {
  if (viewMode.value === 'overview') {
    return hosts.value;
  }
  if (selectedHost.value) {
    const host = hosts.value.find(item => item.host === selectedHost.value);
    if (!host) {
      return [];
    }
    if (selectedDevice.value) {
      return [{
        ...host,
        devices: host.devices.filter(device => device.device === selectedDevice.value),
      }];
    }
    return [host];
  }
  return [];
});

const findDevice = (host: typeof hosts.value[number], deviceName: string) => {
  return host.devices.find(device => device.device === deviceName);
};

const findMetric = (host: typeof hosts.value[number], deviceName: string, metricName: string) => {
  const device = findDevice(host, deviceName);
  return device?.metrics.find(metric => metric.metric === metricName) || null;
};

const deriveUsage = (host: typeof hosts.value[number], deviceName: string) => {
  const usage = findMetric(host, deviceName, 'usage');
  if (usage?.value !== null && usage?.value !== undefined) {
    return { value: usage.value, timestamp: usage.timestamp };
  }
  const used = findMetric(host, deviceName, 'used');
  const total = findMetric(host, deviceName, 'total');
  if (used?.value !== null && total?.value) {
    return { value: ((used?.value ?? 0) / total.value) * 100, timestamp: used?.timestamp || total.timestamp };
  }
  return { value: null, timestamp: null };
};

const overviewCpu = computed(() => viewHosts.value.map(host => {
  const usage = findMetric(host, 'cpu', 'usage');
  return {
    host: host.host || 'unknown',
    value: usage?.value ?? null,
    timestamp: usage?.timestamp ?? null,
  };
}));

const overviewMemory = computed(() => viewHosts.value.map(host => {
  const usage = deriveUsage(host, 'mem');
  return {
    host: host.host || 'unknown',
    value: usage.value,
    timestamp: usage.timestamp,
  };
}));

const overviewDisk = computed(() => viewHosts.value.map(host => {
  const usage = deriveUsage(host, 'disk');
  return {
    host: host.host || 'unknown',
    value: usage.value,
    timestamp: usage.timestamp,
  };
}));

const overviewCpuRows = computed(() => overviewItems.value.map(item => ({
  id: item.id,
  label: item.label,
  value: item.cpu?.value ?? null,
  timestamp: item.cpu?.timestamp ?? null,
})));

const overviewMemoryRows = computed(() => overviewItems.value.map(item => ({
  id: item.id,
  label: item.label,
  value: item.mem?.value ?? null,
  timestamp: item.mem?.timestamp ?? null,
})));

const overviewDiskRows = computed(() => overviewItems.value.map(item => ({
  id: item.id,
  label: item.label,
  value: item.disk?.value ?? null,
  timestamp: item.disk?.timestamp ?? null,
})));

const hostCount = computed(() => viewHosts.value.length);
const totalMetricCount = computed(() => viewHosts.value.reduce((sum, host) => {
  return sum + host.devices.reduce((deviceSum, device) => deviceSum + device.metrics.length, 0);
}, 0));
const lastUpdated = computed(() => {
  const timestamps = viewHosts.value.flatMap(host => host.devices.flatMap(device => device.metrics.map(metric => metric.timestamp).filter(Boolean)));
  if (!timestamps.length) {
    return null;
  }
  const latest = timestamps.sort().at(-1);
  return latest ?? null;
});

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
};

const startAutoRefresh = () => {
  if (refreshTimer) {
    return;
  }
  refreshTimer = setInterval(() => {
    fetchMetrics();
  }, refreshMs);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

watch(autoRefresh, (value) => {
  if (value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

watch(selectedContainer, (value) => {
  if (!value) {
    return;
  }
  containerStore.fetchMetrics({
    host: value.host,
    container: value.name,
    type: value.type,
  });
});

watch([selectedHost, selectedDevice, viewMode], ([host, device, mode]) => {
  if (mode === 'device' && host && device === 'cpu') {
    historyStore.fetchHistory({
      host,
      device,
      metric: 'usage',
    });
  }
});

watch([selectedHost, viewMode], ([host, mode]) => {
  if ((mode === 'docker' || mode === 'proxmox') && host) {
    containersOverviewStore.fetchOverview({
      host,
      type: mode as 'docker' | 'proxmox',
    });
  }
});

onMounted(async () => {
  await Promise.all([fetchMetrics(), fetchTree(), overviewStore.fetchOverview()]);
  const requested = typeof route.query.node === 'string' ? route.query.node : 'overview';
  selected.value = findNodeByValue(treeItems.value, requested) || treeItems.value[0];
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});

watch(treeItems, (items) => {
  if (selected.value) {
    return;
  }
  const requested = typeof route.query.node === 'string' ? route.query.node : 'overview';
  selected.value = findNodeByValue(items, requested) || items[0];
});

watch(selectedValue, (value) => {
  if (route.query.node === value) {
    return;
  }
  router.replace({ query: { ...route.query, node: value } });
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <MetricsOverviewCard
        class="flex-1 min-w-[280px]"
        :window-minutes="windowMinutes"
        :host-count="hostCount"
        :signal-count="totalMetricCount"
        :container-count="overview.total_containers"
        :running-count="overview.total_running"
        :last-updated="lastUpdated"
      />
      <div class="flex items-center gap-2">
        <UButton size="sm" color="neutral" variant="ghost" @click="fetchMetrics">
          Refresh
        </UButton>
        <UButton
          size="sm"
          :color="autoRefresh ? 'primary' : 'neutral'"
          variant="soft"
          @click="toggleAutoRefresh"
        >
          Auto {{ autoRefresh ? 'On' : 'Off' }}
        </UButton>
      </div>
    </div>

    <UPage>

    <template #left>
      <UPageAside>
        <UCard>
          <UTree v-model="selected" :items="treeItems" :get-key="(item) => item.value" />
        </UCard>
      </UPageAside>
    </template>

    <UPageBody>
      <div class="space-y-6">

        <UCard v-if="error && !hosts.length && hasLoaded">
          <p class="text-sm text-red-600">{{ error }}</p>
        </UCard>

        <UCard v-else-if="!hosts.length && hasLoaded">
          <p class="text-sm text-muted">No recent metrics found in this window.</p>
        </UCard>

        <div v-else class="space-y-8">
          <UCard v-if="(viewMode === 'docker' || viewMode === 'proxmox') && !selectedContainer && containersLoading">
            <p class="text-sm text-muted">Loading containers...</p>
          </UCard>
          <UCard v-else-if="(viewMode === 'docker' || viewMode === 'proxmox') && !selectedContainer && containersError">
            <p class="text-sm text-red-600">{{ containersError }}</p>
          </UCard>
          <MetricsContainersOverviewPanel
            v-else-if="(viewMode === 'docker' || viewMode === 'proxmox') && !selectedContainer && containersHost && containersType"
            :host="containersHost"
            :type="containersType"
            :total="containersTotal"
            :running="containersRunning"
            :items="containersItems"
          />
          <UCard v-else-if="selectedContainer && containerLoading">
            <p class="text-sm text-muted">Loading container metrics...</p>
          </UCard>
          <UCard v-else-if="selectedContainer && containerError">
            <p class="text-sm text-red-600">{{ containerError }}</p>
          </UCard>
          <MetricsDockerContainerPanel
            v-else-if="selectedContainer && containerHost && containerName && containerType"
            :host="containerHost"
            :container="containerName"
            :type="containerType"
            :metrics="containerMetrics"
          />
          <UCard v-else-if="viewMode === 'device' && selectedDevice === 'cpu' && historyLoading">
            <p class="text-sm text-muted">Loading CPU history...</p>
          </UCard>
          <UCard v-else-if="viewMode === 'device' && selectedDevice === 'cpu' && historyError">
            <p class="text-sm text-red-600">{{ historyError }}</p>
          </UCard>
          <div
            v-else-if="viewMode === 'device' && selectedDevice === 'cpu' && historyHost && historyDevice === 'cpu'"
            class="space-y-6"
          >
            <MetricsHostSection
              v-for="host in viewHosts"
              :key="host.host || 'unknown'"
              :host="host.host || 'unknown'"
              :devices="host.devices"
            />
            <MetricsCpuHistoryChart
              :host="historyHost"
              :points="historyPoints"
            />
          </div>
          <div v-else-if="viewMode === 'overview'" class="space-y-8">
            <section class="space-y-3">
              <div>
                <h2 class="text-lg font-semibold">CPU Usage</h2>
                <p class="text-xs text-muted">Right now, by host.</p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricsGaugeCard
                  v-for="row in overviewCpuRows"
                  :key="`cpu-${row.id}`"
                  :label="row.label"
                  :value="row.value"
                  unit="pct"
                  :timestamp="row.timestamp"
                />
              </div>
            </section>

            <section class="space-y-3">
              <div>
                <h2 class="text-lg font-semibold">Memory</h2>
                <p class="text-xs text-muted">Usage percent by host.</p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricsGaugeCard
                  v-for="row in overviewMemoryRows"
                  :key="`mem-${row.id}`"
                  :label="row.label"
                  :value="row.value"
                  unit="pct"
                  :timestamp="row.timestamp"
                />
              </div>
            </section>

            <section class="space-y-3">
              <div>
                <h2 class="text-lg font-semibold">Disk</h2>
                <p class="text-xs text-muted">Usage percent by host.</p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricsGaugeCard
                  v-for="row in overviewDiskRows"
                  :key="`disk-${row.id}`"
                  :label="row.label"
                  :value="row.value"
                  unit="pct"
                  :timestamp="row.timestamp"
                />
              </div>
            </section>
          </div>
          <MetricsHostSection
            v-else
            v-for="host in viewHosts"
            :key="host.host || 'unknown'"
            :host="host.host || 'unknown'"
            :devices="host.devices"
          />
        </div>
      </div>
    </UPageBody>
  </UPage>
  </div>
</template>
