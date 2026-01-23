<script setup lang="ts">
import { useMetricsHostsStore } from '../../metricsHosts';
import { useMetricsRefreshStore } from '../../metricsRefresh';
import { useMetricsStore } from '../../metrics';

const route = useRoute();
const metricsStore = useMetricsStore();
const hostsStore = useMetricsHostsStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const hostEntry = computed(() => hostsStore.hostFor(host.value));
const viewHosts = computed(() => hostsStore.hostsFor(host.value));

const { loading, error } = storeToRefs(metricsStore);

watch(host, () => {
  refreshStore.setRefreshers([]);
}, { immediate: true });

onBeforeUnmount(() => {
  refreshStore.clearRefreshers();
});
</script>

<template>
  <MetricsShell>
    <div class="space-y-6">
      <UCard v-if="loading">
        <p class="text-sm text-muted">Loading host metrics...</p>
      </UCard>
      <UCard v-else-if="error">
        <p class="text-sm text-red-600">{{ error }}</p>
      </UCard>
      <UCard v-else-if="!hostEntry">
        <p class="text-sm text-muted">Host not found.</p>
      </UCard>
      <MetricsHostSection
        v-else
        v-for="hostItem in viewHosts"
        :key="hostItem.host || 'unknown'"
        :host="hostItem.host || 'unknown'"
        :devices="hostItem.devices"
      />
    </div>
  </MetricsShell>
</template>
