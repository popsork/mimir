<script setup lang="ts">
import { useContainersOverviewStore } from '../../../../stores/containersOverview';
import { useMetricsRefreshStore } from '../../../../stores/metricsRefresh';

definePageMeta({
  layout: 'metrics',
});

const route = useRoute();
const containersStore = useContainersOverviewStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);

const { total, running, items, loading, error } = storeToRefs(containersStore);

const load = async () => {
  if (!host.value) {
    return;
  }
  await containersStore.fetchOverview({
    host: host.value,
    type: 'proxmox',
  });
};

watch(host, () => {
  refreshStore.setRefreshers([load]);
  load();
}, { immediate: true });

onBeforeUnmount(() => {
  refreshStore.clearRefreshers();
});
</script>

<template>
  <div class="space-y-6">
    <UCard v-if="loading">
      <p class="text-sm text-muted">Loading containers...</p>
    </UCard>
    <UCard v-else-if="error">
      <p class="text-sm text-red-600">{{ error }}</p>
    </UCard>
    <MetricsContainersOverviewPanel
      v-else-if="host"
      :host="host"
      type="proxmox"
      :total="total"
      :running="running"
      :items="items"
    />
  </div>
</template>
