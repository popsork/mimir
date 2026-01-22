<script setup lang="ts">
import { useMetricsHostsStore } from '../../../stores/metricsHosts';
import { useMetricsRefreshStore } from '../../../stores/metricsRefresh';
import { useMetricsStore } from '../../../stores/metrics';

definePageMeta({
  layout: 'metrics',
});

const route = useRoute();
const hostsStore = useMetricsHostsStore();
const refreshStore = useMetricsRefreshStore();
const metricsStore = useMetricsStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const device = computed(() => typeof route.params.device === 'string' ? route.params.device : null);

const hostEntry = computed(() => hostsStore.hostWithDevice(host.value, device.value));
const viewHosts = computed(() => hostEntry.value ? [hostEntry.value] : []);
const { loading } = storeToRefs(metricsStore);

watch([host, device], () => {
  refreshStore.setRefreshers([]);
}, { immediate: true });

onBeforeUnmount(() => {
  refreshStore.clearRefreshers();
});
</script>

<template>
  <div class="space-y-6">
    <UCard v-if="loading">
      <p class="text-sm text-muted">Loading device metrics...</p>
    </UCard>
    <UCard v-else-if="!hostEntry">
      <p class="text-sm text-muted">Device not found for this host.</p>
    </UCard>
    <MetricsHostSection
      v-else
      v-for="hostItem in viewHosts"
      :key="hostItem.host || 'unknown'"
      :host="hostItem.host || 'unknown'"
      :devices="hostItem.devices"
    />
  </div>
</template>
