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
    metrics: ['usage'],
  });
}, { immediate: true });

const usageSeries = computed(() => mergeSeries({
  usage: series.value.usage ?? [],
}));

const categories = {
  usage: { name: 'Disk Usage', color: '#22c55e' },
};

const yFormatter = (value: number) => `${formatNumber(value, 1)} %`;
</script>

<template>
  <MetricsChartsLineCard
    title="Disk Usage"
    :subtitle="host"
    :series="usageSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>
