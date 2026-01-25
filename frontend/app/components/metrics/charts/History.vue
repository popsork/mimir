<template>
  <MetricsChartsLineCard
    :title="props.title"
    :subtitle="host"
    :series="mergedSeries"
    :categories="categories"
    :y-formatter="yFormatter"
  />
</template>

<script setup lang="ts">
import {useMetricsSeriesStore} from "~/stores/metrics/series";

type Category = {
  name: string;
  color: string;
};

const props = defineProps<{
  title: string,
  host: string,
  device: string,
  metrics: string[] | string,
}>();

const { t } = useI18n();
const { formatNumber } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const seriesStore = useMetricsSeriesStore();

const series = computed(() => seriesStore.seriesFor(props.host, props.device));
const metricsArray = computed(() => {
  return typeof props.metrics === "string" ? props.metrics.split(",") : props.metrics;
});

const refresh = () => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: metricsArray.value,
  });
}

const mergedSeries = computed(() => {
  const seriesByKey: Record<string, HistoryPoint[] | SeriesPoint[]> = {};
  for(const metric of metricsArray.value) {
    seriesByKey[metric] = series.value[metric] ?? [];
  }

  return mergeSeries(seriesByKey);
});

const colors = [
  '#22c55e',
  '#f97316',
];

const categories = computed(() => {
  const categories: Record<string, Category> = {};

  let color = 0;
  for(const metric of metricsArray.value) {
    categories[metric] = {
      name: t(`metrics.devices.labels.${props.device}`) + " - " + t(`metrics.metrics.labels.${metric}`),
      color: colors[color++]!,
    }
  }

  return categories;
});

const yFormatter = (value: number) => formatNumber(value, 1);

useMetricsTicker(() => {
  refresh();
});

refresh();
</script>

<style scoped lang="scss">

</style>
