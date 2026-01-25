<script setup lang="ts">
import { mergeSeries } from '~/utils/metricsSeries';
import { useMetricsSeriesStore } from '~/stores/metrics/series';

const props = defineProps<{
  host: string;
  device: string;
}>();

const { formatNumber } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const seriesStore = useMetricsSeriesStore();

const series = computed(() => seriesStore.seriesFor(props.host, props.device));
const loading = computed(() => seriesStore.loadingFor(props.host, props.device));

watch([() => props.host, () => props.device, windowMinutes], () => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: ['load1', 'load5', 'load15'],
  });
}, { immediate: true });

const mergedSeries = computed(() => mergeSeries({
  load1: series.value.load1 ?? [],
  load5: series.value.load5 ?? [],
  load15: series.value.load15 ?? [],
}));

const categories = {
  load1: { name: 'Load 1m', color: '#f97316' },
  load5: { name: 'Load 5m', color: '#facc15' },
  load15: { name: 'Load 15m', color: '#38bdf8' },
};

const yFormatter = (value: number) => formatNumber(value, 1);
</script>

<template>
  <MetricsChartsLineCard
    title="Load Averages"
    :subtitle="host"
    :series="mergedSeries"
    :categories="categories"
    :y-formatter="yFormatter"
    :show-legend="true"
  />
</template>
