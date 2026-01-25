<script setup lang="ts">
import { mergeSeries, toRateSeries } from '~/utils/metricsSeries';
import { useContainerHistoryStore } from '~/stores/containers/history';

const props = defineProps<{
  host: string;
  container: string;
  type: 'docker' | 'proxmox';
}>();

const { formatNumber, formatValue, formatDurationSeconds, normalizePercent } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const historyStore = useContainerHistoryStore();

const { series, loading, error } = storeToRefs(historyStore);

watch([() => props.host, () => props.container, () => props.type, windowMinutes], () => {
  historyStore.fetchHistory({
    host: props.host,
    container: props.container,
    type: props.type,
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
  });
}, { immediate: true });

const cpuSeries = computed(() => mergeSeries({ cpu: series.value.cpu_usage_pct ?? [] }));

const memUsageSeries = computed(() => {
  if ((series.value.mem_usage_pct ?? []).length) {
    return mergeSeries({ mem: series.value.mem_usage_pct ?? [] });
  }

  const merged = mergeSeries({
    used: series.value.mem_used_bytes ?? [],
    total: series.value.mem_limit_bytes ?? [],
  });

  return merged
    .map(point => {
      const used = typeof point.used === 'number' ? point.used : 0;
      const total = typeof point.total === 'number' ? point.total : 0;
      if (!total) {
        return null;
      }
      return {
        timestamp: point.timestamp as string,
        value: (used / total) * 100,
      };
    })
    .filter(Boolean) as Array<{ timestamp: string; value: number }>;
});

const netSeries = computed(() => {
  const rx = toRateSeries(series.value.net_rx_bytes ?? []);
  const tx = toRateSeries(series.value.net_tx_bytes ?? []);
  return mergeSeries({ rx, tx });
});

const statusSeries = computed(() => mergeSeries({ status: series.value.status ?? [] }));
const uptimeSeries = computed(() => mergeSeries({ uptime: series.value.uptime_seconds ?? [] }));

const cpuCategories = { cpu: { name: 'CPU %', color: '#22c55e' } };
const memCategories = { mem: { name: 'Mem %', color: '#38bdf8' } };
const netCategories = {
  rx: { name: 'RX', color: '#22c55e' },
  tx: { name: 'TX', color: '#f97316' },
};
const statusCategories = { status: { name: 'Status', color: '#f97316' } };
const uptimeCategories = { uptime: { name: 'Uptime', color: '#a855f7' } };

const percentFormatter = (value: number) => `${formatNumber(normalizePercent(value), 1)} %`;
const bytesPerSecondFormatter = (value: number) => `${formatValue(value, 'bytes')}/s`;
const statusAxisFormatter = (value: number) => (value >= 1 ? '1' : '0');
const statusTooltipFormatter = (value: number) => (value >= 1 ? 'Running' : 'Stopped');
const uptimeFormatter = (value: number) => formatDurationSeconds(value);
</script>

<template>
  <div v-if="loading" class="text-center text-muted">Loading history...</div>
  <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
  <div v-else class="space-y-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <MetricsChartsLineCard
        title="Container CPU Usage"
        :subtitle="`${container} · ${host}`"
        :series="cpuSeries"
        :categories="cpuCategories"
        :y-formatter="percentFormatter"
      />
      <MetricsChartsLineCard
        title="Container Memory Usage"
        :subtitle="`${container} · ${host}`"
        :series="memUsageSeries"
        :categories="memCategories"
        :y-formatter="percentFormatter"
      />
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <MetricsChartsLineCard
        title="Container Network Throughput"
        :subtitle="`${container} · ${host}`"
        :series="netSeries"
        :categories="netCategories"
        :y-formatter="bytesPerSecondFormatter"
        :show-legend="true"
      />
      <MetricsChartsLineCard
        title="Container Status"
        :subtitle="`${container} · ${host}`"
        :series="statusSeries"
        :categories="statusCategories"
        :y-formatter="statusAxisFormatter"
        :tooltip-formatter="statusTooltipFormatter"
      />
    </div>
    <MetricsChartsLineCard
      title="Container Uptime"
      :subtitle="`${container} · ${host}`"
      :series="uptimeSeries"
      :categories="uptimeCategories"
      :y-formatter="uptimeFormatter"
      :tooltip-formatter="uptimeFormatter"
    />
  </div>
</template>
