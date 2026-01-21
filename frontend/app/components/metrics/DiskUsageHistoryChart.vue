<script setup lang="ts">
import { mergeSeries } from '../../utils/metricsSeries';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  series: Record<string, SeriesPoint[]>;
}>();

const { formatNumber } = useMetricsFormatting();

const usageSeries = computed(() => mergeSeries({ usage: props.series.usage ?? [] }));

const categories = {
  usage: { name: 'Disk Usage', color: '#22c55e' },
};

const yFormatter = (value: number) => `${formatNumber(value, 1)} %`;
</script>

<template>
  <MetricsLineChartCard
    title="Disk Usage"
    :subtitle="host"
    :series="usageSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>
