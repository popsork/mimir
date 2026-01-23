<script setup lang="ts">
import { useMetricsDeviceSeriesStore } from '../../metricsDeviceSeries';
import { useMetricsHostsStore } from '../../metricsHosts';
import { useMetricsRefreshStore } from '../../metricsRefresh';

const route = useRoute();
const hostsStore = useMetricsHostsStore();
const deviceSeriesStore = useMetricsDeviceSeriesStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const viewHosts = computed(() => hostsStore.hostsFor(host.value, 'system'));

const series = computed(() => deviceSeriesStore.seriesFor(host.value, 'system'));
const loading = computed(() => deviceSeriesStore.loadingFor(host.value, 'system'));
const error = computed(() => deviceSeriesStore.errorFor(host.value, 'system'));

const load = async () => {
  if (!host.value) {
    return;
  }
  await deviceSeriesStore.fetchSeries({
    host: host.value,
    device: 'system',
    metrics: ['load1', 'load5', 'load15'],
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
  <MetricsShell>
    <div class="space-y-6">
      <UCard v-if="loading">
        <p class="text-sm text-muted">Loading device history...</p>
      </UCard>
      <UCard v-else-if="error">
        <p class="text-sm text-red-600">{{ error }}</p>
      </UCard>

      <MetricsHostSection
        v-for="hostItem in viewHosts"
        :key="hostItem.host || 'unknown'"
        :host="hostItem.host || 'unknown'"
        :devices="hostItem.devices"
      />

      <MetricsLoadHistoryChart
        v-if="host"
        :host="host"
        :series="series"
      />
    </div>
  </MetricsShell>
</template>
