<template>
  <UNavigationMenu v-if="loaded" orientation="vertical" :items="navigationTree" />
</template>

<script setup lang="ts">
import { useMetricsTreeStore} from "~/stores/metrics/tree";
import type {NavigationMenuItem} from "#ui/components/NavigationMenu.vue";

const { t } = useI18n();

const treeStore = useMetricsTreeStore();
const { hosts, loaded } = storeToRefs(treeStore);
treeStore.loadTreeIfNeeded();

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

const navigationTree = computed<NavigationMenuItem[]>(() => {
  const baseItems: NavigationMenuItem[] = [
    { label: 'Overview', to: '/metrics/overview', icon: 'i-lucide-layout-dashboard' }
  ];

  for (const host of hosts.value) {
    const children: NavigationMenuItem[] = [];

    for (const device of host.devices) {
      children.push({
        label: t(`metrics.devices.labels.${device}`),
        to: `/metrics/${host.host}/${device}`,
        icon: iconMap[device] || 'i-lucide-activity',
      });
    }

    if (host.docker.containers.length) {
      children.push({
        label: 'Docker',
        to: `/metrics/${host.host}/docker`,
        icon: 'i-lucide-box',
        children: host.docker.containers.map((container: { running: any; name: any; }) => {
          const status = container.running ? "running" : "stopped";
          return {
            label: container.name,
            to: `/metrics/${host.host}/docker/${container.name}`,
            status,
            icon: 'i-lucide-circle',
            ui: { linkLeadingIcon: container.running ? 'text-emerald-500' : 'text-rose-500' }
          };
        })
      });
    }

    baseItems.push({
      label: host.host,
      to: `/metrics/${host.host}`,
      icon: 'i-lucide-server',
      children
    });
  }

  return baseItems;
});

</script>

<style scoped lang="scss">

</style>
