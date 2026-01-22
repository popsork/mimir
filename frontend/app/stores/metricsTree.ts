import { useMetricsStore } from './metrics';

export type MetricsTreeOverview = {
  hosts: number;
  docker_containers: number;
  container_containers: number;
  total_containers: number;
  docker_running: number;
  container_running: number;
  total_running: number;
};

export type MetricsTreeHost = {
  host: string;
  devices: string[];
  docker: { containers: Array<{ name: string; running: boolean | null }> };
  proxmox: { containers: Array<{ name: string; running: boolean | null }> };
};

type MetricsTreeResponse = {
  overview: MetricsTreeOverview;
  hosts: MetricsTreeHost[];
};

export type MetricsTreeNode = {
  label: string;
  value: string;
  status?: 'running' | 'stopped' | null;
  icon?: string;
  ui?: {
    linkLeadingIcon?: string;
  };
  children?: MetricsTreeNode[];
};

export const useMetricsTreeStore = defineStore('metricsTree', () => {
  const metricsStore = useMetricsStore();
  const overview = ref<MetricsTreeOverview>({
    hosts: 0,
    docker_containers: 0,
    container_containers: 0,
    total_containers: 0,
    docker_running: 0,
    container_running: 0,
    total_running: 0,
  });
  const hosts = ref<MetricsTreeHost[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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

  const statusIcon = (status: MetricsTreeNode['status']) => {
    if (!status) {
      return undefined;
    }
    return 'i-lucide-circle';
  };

  const statusIconClass = (status: MetricsTreeNode['status']) => {
    if (status === 'running') {
      return 'text-emerald-500';
    }
    if (status === 'stopped') {
      return 'text-rose-500';
    }
    return undefined;
  };

  const items = computed<MetricsTreeNode[]>(() => {
    const baseItems: MetricsTreeNode[] = [
      { label: 'Overview', value: 'overview', icon: 'i-lucide-layout-dashboard' }
    ];

    for (const host of hosts.value) {
      const children: MetricsTreeNode[] = [];

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

      baseItems.push({
        label: host.host,
        value: `host:${host.host}`,
        icon: 'i-lucide-server',
        children
      });
    }

    return baseItems;
  });

  const findNodeByValue = (value: string) => {
    const walk = (nodes: MetricsTreeNode[]): MetricsTreeNode | undefined => {
      for (const node of nodes) {
        if (node.value === value) {
          return node;
        }
        if (node.children) {
          const found = walk(node.children);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    return walk(items.value);
  };

  const fetchTree = async () => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch('/api/metrics/tree') as MetricsTreeResponse;
      overview.value = data.overview;
      hosts.value = data.hosts;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load metrics tree.';
    } finally {
      loading.value = false;
    }
  };

  return {
    overview,
    hosts,
    items,
    loading,
    error,
    fetchTree,
    findNodeByValue,
  };
});
