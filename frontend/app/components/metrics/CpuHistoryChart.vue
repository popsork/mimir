<script setup lang="ts">
import { CurveType } from '@unovis/ts';
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

const mergedSeries = computed(() => mergeSeries({
  usage: props.series.usage ?? [],
  temp: props.series.temp ?? [],
}));

const xFormatter = (value: number, index?: number) => {
  const dateValue = typeof index === 'number' ? mergedSeries.value[index]?.timestamp : value;
  if (!dateValue) {
    return '';
  }
  return new Date(dateValue).toLocaleString();
};

const categories = {
  usage: { name: 'CPU Usage (%)', color: '#22c55e' },
  temp: { name: 'CPU Temp (C)', color: '#f97316' },
};

const tooltipTitleFormatter = (_title: string, item: { i: number }) => {
  const point = mergedSeries.value[item.i];
  if (!point || !point.timestamp) {
    return '';
  }
  return new Date(point.timestamp).toLocaleString();
};

const yFormatter = (value: number) => formatNumber(value, 1);

const tooltipFormatter = (value: number) => formatNumber(value, 1);
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">CPU Usage</p>
        <p class="text-sm font-semibold">{{ host }}</p>
      </div>
    </div>
    <div v-if="mergedSeries.length" class="mt-4">
      <LineChart
        :data="mergedSeries"
        index="timestamp"
        :categories="categories"
        :y-formatter="yFormatter"
        :x-formatter="xFormatter"
        :tooltip-formatter="tooltipFormatter"
        :tooltip-label-formatter="tooltipTitleFormatter"
        :curve-type="CurveType.MonotoneX"
        :show-grid-lines="false"
        :show-legend="false"
      />
    </div>
    <div v-else class="mt-4 text-sm text-muted">
      No data in this window.
    </div>
  </UCard>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}
</style>
