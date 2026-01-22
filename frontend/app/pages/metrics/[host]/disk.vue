<script setup lang="ts">
import { useMetricsDeviceSeriesStore } from '../../../stores/metricsDeviceSeries';
import { useMetricsHostsStore } from '../../../stores/metricsHosts';
import { useMetricsRefreshStore } from '../../../stores/metricsRefresh';

definePageMeta({
  layout: 'metrics',
});

const route = useRoute();
const hostsStore = useMetricsHostsStore();
const deviceSeriesStore = useMetricsDeviceSeriesStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const viewHosts = computed(() => hostsStore.hostsFor(host.value, 'disk'));

const series = computed(() => deviceSeriesStore.seriesFor(host.value, 'disk'));
const loading = computed(() => deviceSeriesStore.loadingFor(host.value, 'disk'));
const error = computed(() => deviceSeriesStore.errorFor(host.value, 'disk'));

const load = async () => {
  if (!host.value) {
    return;
  }
  await deviceSeriesStore.fetchSeries({
    host: host.value,
    device: 'disk',
    metrics: ['usage'],
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

    <MetricsDiskUsageHistoryChart
      v-if="host"
      :host="host"
      :series="series"
    />
  </div>
</template>
