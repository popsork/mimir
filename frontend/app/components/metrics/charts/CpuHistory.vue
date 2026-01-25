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
    metrics: ['usage', 'temp'],
  });
}, { immediate: true });

const mergedSeries = computed(() => mergeSeries({
  usage: series.value.usage ?? [],
  temp: series.value.temp ?? [],
}));

const categories = {
  usage: { name: 'CPU Usage (%)', color: '#22c55e' },
  temp: { name: 'CPU Temp (C)', color: '#f97316' },
};

useMetricsTicker(() => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: ['usage', 'temp'],
  });
});

const yFormatter = (value: number) => formatNumber(value, 1);
</script>

<template>
  <MetricsChartsLineCard
    title="CPU Usage"
    :subtitle="host"
    :series="mergedSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>
