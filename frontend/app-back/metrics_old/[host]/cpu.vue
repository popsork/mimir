<script setup lang="ts">
import { useMetricsDeviceSeriesStore } from '../../metricsDeviceSeries';
import { useMetricsHistoryStore } from '../../metricsHistory';
import { useMetricsHostsStore } from '../../metricsHosts';
import { useMetricsRefreshStore } from '../../metricsRefresh';

const route = useRoute();
const hostsStore = useMetricsHostsStore();
const historyStore = useMetricsHistoryStore();
const deviceSeriesStore = useMetricsDeviceSeriesStore();
const refreshStore = useMetricsRefreshStore();

const host = computed(() => typeof route.params.host === 'string' ? route.params.host : null);
const viewHosts = computed(() => hostsStore.hostsFor(host.value, 'cpu'));

const cpuSeries = computed(() => deviceSeriesStore.seriesFor(host.value, 'cpu'));
const systemSeries = computed(() => deviceSeriesStore.seriesFor(host.value, 'system'));
const historyPoints = computed(() => historyStore.points);
const historyLoading = computed(() => historyStore.loading);
const historyError = computed(() => historyStore.error);

const cpuLoading = computed(() => deviceSeriesStore.loadingFor(host.value, 'cpu'));
const cpuError = computed(() => deviceSeriesStore.errorFor(host.value, 'cpu'));

const load = async () => {
  if (!host.value) {
    return;
  }
  await Promise.all([
    historyStore.fetchHistory({
      host: host.value,
      device: 'cpu',
      metric: 'usage',
    }),
    deviceSeriesStore.fetchSeries({
      host: host.value,
      device: 'cpu',
      metrics: ['usage', 'temp'],
    }),
    deviceSeriesStore.fetchSeries({
      host: host.value,
      device: 'system',
      metrics: ['load1', 'load5', 'load15'],
    }),
  ]);
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
      <UCard v-if="historyLoading || cpuLoading">
        <p class="text-sm text-muted">Loading CPU history...</p>
      </UCard>
      <UCard v-else-if="historyError || cpuError">
        <p class="text-sm text-red-600">{{ historyError || cpuError }}</p>
      </UCard>

      <MetricsHostSection
        v-for="hostItem in viewHosts"
        :key="hostItem.host || 'unknown'"
        :host="hostItem.host || 'unknown'"
        :devices="hostItem.devices"
      />

      <MetricsCpuHistoryChart
        v-if="host"
        :host="host"
        :series="cpuSeries"
      />
      <MetricsLoadHistoryChart
        v-if="host"
        :host="host"
        :series="systemSeries"
        :cpu-points="historyPoints"
      />
    </div>
  </MetricsShell>
</template>
