<script setup lang="ts">
import { useContainerMetricsHistoryStore } from '../../../../stores/containerMetricsHistory';
import { useContainerMetricsStore } from '../../../../stores/containerMetrics';
import { useMetricsRefreshStore } from '../../../../stores/metricsRefresh';

definePageMeta({
  layout: 'metrics',
});

const route = useRoute();
const containerStore = useContainerMetricsStore();
const containerHistoryStore = useContainerMetricsHistoryStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const container = computed(() => typeof route.params.container === 'string' ? route.params.container : null);

const { metrics, loading, error } = storeToRefs(containerStore);
const {
  series,
  loading: historyLoading,
  error: historyError,
} = storeToRefs(containerHistoryStore);

const load = async () => {
  if (!host.value || !container.value) {
    return;
  }
  await Promise.all([
    containerStore.fetchMetrics({
      host: host.value,
      container: container.value,
      type: 'docker',
    }),
    containerHistoryStore.fetchHistory({
      host: host.value,
      container: container.value,
      type: 'docker',
      metrics: [
        'cpu_usage_pct',
        'mem_usage_pct',
        'mem_used_bytes',
        'mem_limit_bytes',
        'net_rx_bytes',
        'net_tx_bytes',
        'status',
        'uptime_seconds',
      ],
    }),
  ]);
};

watch([host, container], () => {
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
      <p class="text-sm text-muted">Loading container metrics...</p>
    </UCard>
    <UCard v-else-if="error">
      <p class="text-sm text-red-600">{{ error }}</p>
    </UCard>
    <MetricsDockerContainerPanel
      v-else-if="host && container"
      :host="host"
      :container="container"
      type="docker"
      :metrics="metrics"
    />

    <UCard v-if="historyLoading">
      <p class="text-sm text-muted">Loading container history...</p>
    </UCard>
    <UCard v-else-if="historyError">
      <p class="text-sm text-red-600">{{ historyError }}</p>
    </UCard>
    <MetricsContainerHistoryPanel
      v-else-if="host && container"
      :host="host"
      :container="container"
      :series="series"
    />
  </div>
</template>
