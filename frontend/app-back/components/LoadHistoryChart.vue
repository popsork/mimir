<script setup lang="ts">
import { mergeSeries } from '../../utils/metricsSeries';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  series: Record<string, SeriesPoint[]>;
  cpuPoints?: SeriesPoint[];
}>();

const { formatNumber } = useMetricsFormatting();

const mergedSeries = computed(() => {
  const base = {
    load1: props.series.load1 ?? [],
    load5: props.series.load5 ?? [],
    load15: props.series.load15 ?? [],
  } as Record<string, SeriesPoint[]>;
  if (props.cpuPoints?.length) {
    base.cpu = props.cpuPoints;
  }
  return mergeSeries(base);
});

const categories = computed(() => {
  const base: Record<string, { name: string; color: string }> = {
    load1: { name: 'Load 1m', color: '#f97316' },
    load5: { name: 'Load 5m', color: '#facc15' },
    load15: { name: 'Load 15m', color: '#38bdf8' },
  };
  if (props.cpuPoints?.length) {
    base.cpu = { name: 'CPU %', color: '#22c55e' };
  }
  return base;
});

const yFormatter = (value: number) => formatNumber(value, 1);
</script>

<template>
  <MetricsLineChartCard
    title="Load Averages"
    :subtitle="host"
    :series="mergedSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>
