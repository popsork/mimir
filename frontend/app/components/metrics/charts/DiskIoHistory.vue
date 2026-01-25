<script setup lang="ts">
import { mergeSeries, toRateSeries } from '~/utils/metricsSeries';
import { useMetricsSeriesStore } from '~/stores/metrics/series';

const props = defineProps<{
  host: string;
  device: string;
}>();

const { formatValue, formatNumber } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const seriesStore = useMetricsSeriesStore();

const series = computed(() => seriesStore.seriesFor(props.host, props.device));
const loading = computed(() => seriesStore.loadingFor(props.host, props.device));

watch([() => props.host, () => props.device, windowMinutes], () => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: ['read_bytes', 'write_bytes', 'read_ops', 'write_ops'],
  });
}, { immediate: true });

const throughputSeries = computed(() => {
  const read = toRateSeries(series.value.read_bytes ?? []);
  const write = toRateSeries(series.value.write_bytes ?? []);
  return mergeSeries({ read, write });
});

const opsSeries = computed(() => {
  const readOps = toRateSeries(series.value.read_ops ?? []);
  const writeOps = toRateSeries(series.value.write_ops ?? []);
  return mergeSeries({ readOps, writeOps });
});

const throughputCategories = {
  read: { name: 'Read', color: '#22c55e' },
  write: { name: 'Write', color: '#f97316' },
};

const opsCategories = {
  readOps: { name: 'Read Ops', color: '#38bdf8' },
  writeOps: { name: 'Write Ops', color: '#a855f7' },
};

const throughputFormatter = (value: number) => `${formatValue(value, 'bytes')}/s`;
const opsFormatter = (value: number) => `${formatNumber(value, 1)}/s`;
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <MetricsChartsLineCard
      title="Disk Throughput"
      :subtitle="host"
      :series="throughputSeries"
      :categories="throughputCategories"
      :y-formatter="throughputFormatter"
      :show-legend="true"
    />
    <MetricsChartsLineCard
      title="Disk IOPS"
      :subtitle="host"
      :series="opsSeries"
      :categories="opsCategories"
      :y-formatter="opsFormatter"
      :show-legend="true"
    />
  </div>
</template>
