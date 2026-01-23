import {WaitingFor} from "~/enums/WaitingFor";
import {useI18n} from "#imports";

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

export const useMetricsTreeStore = defineStore("metrics-tree", () => {
  const loaded = ref(false);
  const waitStore = useWaitStore();
  const { t } = useI18n();

  const hosts = ref<MetricsTreeHost[]>([]);
  const loading = computed(() => waitStore.is(WaitingFor.MetricsTree));

  const loadTree = async (refresh: boolean = false) => {
    if (!refresh) {
      waitStore.start(WaitingFor.MetricsTree);
    }

    try {
      const data = await $fetch("/api/metrics/tree") as MetricsTreeResponse;
      hosts.value = data.hosts;
      loaded.value = true;
    } catch (err) {
      // handle?
    } finally {
      if (!refresh) {
        waitStore.end(WaitingFor.MetricsTree);
      }
    }
  }

  const loadTreeIfNeeded = () => {
    if (loading.value || loaded.value) {
      return;
    }

    loadTree();
  };

  const refresh = async () => {
    return await loadTree(true);
  };

  return {
    loadTreeIfNeeded,
    refresh,
    loading,
    loaded,
    hosts,
  }
});
