<script setup lang="ts">
import { mergeSeries, toRateSeries } from '~/utils/metricsSeries';
import { useMetricsSeriesStore } from '~/stores/metrics/series';

const props = defineProps<{
  host: string;
  device: string;
  title?: string;
}>();

const { formatValue } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const seriesStore = useMetricsSeriesStore();

const series = computed(() => seriesStore.seriesFor(props.host, props.device));
const loading = computed(() => seriesStore.loadingFor(props.host, props.device));

watch([() => props.host, () => props.device, windowMinutes], () => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: ['bytes_in', 'bytes_out'],
  });
}, { immediate: true });

const rateSeries = computed(() => {
  const rx = toRateSeries(series.value.bytes_in ?? []);
  const tx = toRateSeries(series.value.bytes_out ?? []);
  return mergeSeries({ rx, tx });
});

const categories = {
  rx: { name: 'RX', color: '#38bdf8' },
  tx: { name: 'TX', color: '#f97316' },
};

const yFormatter = (value: number) => `${formatValue(value, 'bytes')}/s`;
</script>

<template>
  <MetricsChartsLineCard
    :title="title || 'Network Throughput'"
    :subtitle="host"
    :series="rateSeries"
    :categories="categories"
    :y-formatter="yFormatter"
    :show-legend="true"
  />
</template>
