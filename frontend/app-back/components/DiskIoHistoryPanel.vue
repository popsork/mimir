<script setup lang="ts">
import { mergeSeries, toRateSeries } from '../../utils/metricsSeries';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  series: Record<string, SeriesPoint[]>;
}>();

const { formatValue, formatNumber } = useMetricsFormatting();

const throughputSeries = computed(() => {
  const read = toRateSeries(props.series.read_bytes ?? []);
  const write = toRateSeries(props.series.write_bytes ?? []);
  return mergeSeries({
    read,
    write,
  });
});

const opsSeries = computed(() => {
  const readOps = toRateSeries(props.series.read_ops ?? []);
  const writeOps = toRateSeries(props.series.write_ops ?? []);
  return mergeSeries({
    readOps,
    writeOps,
  });
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
    <MetricsLineChartCard
      title="Disk Throughput"
      :subtitle="host"
      :series="throughputSeries"
      :categories="throughputCategories"
      :y-formatter="throughputFormatter"
    />
    <MetricsLineChartCard
      title="Disk IOPS"
      :subtitle="host"
      :series="opsSeries"
      :categories="opsCategories"
      :y-formatter="opsFormatter"
    />
  </div>
</template>
