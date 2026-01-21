<script setup lang="ts">
import { mergeSeries, toRateSeries } from '../../utils/metricsSeries';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  series: Record<string, SeriesPoint[]>;
  title?: string;
}>();

const { formatValue } = useMetricsFormatting();

const rateSeries = computed(() => {
  const rx = toRateSeries(props.series.bytes_in ?? []);
  const tx = toRateSeries(props.series.bytes_out ?? []);
  return mergeSeries({
    rx,
    tx,
  });
});

const categories = {
  rx: { name: 'RX', color: '#38bdf8' },
  tx: { name: 'TX', color: '#f97316' },
};

const yFormatter = (value: number) => `${formatValue(value, 'bytes')}/s`;
</script>

<template>
  <MetricsLineChartCard
    :title="title || 'Network Throughput'"
    :subtitle="host"
    :series="rateSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>
