<script setup lang="ts">
import { CurveType } from '@unovis/ts';
type HistoryPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  points: HistoryPoint[];
}>();

const series = computed(() => props.points
  .map(point => ({
    timestamp: point.timestamp ?? null,
    value: point.value ?? 0,
  }))
  .filter(point => Boolean(point.timestamp)));

const xFormatter = (value: number, index?: number) => {
  const dateValue = typeof index === 'number' ? series.value[index]?.timestamp : value;
  if (!dateValue) {
    return '';
  }
  return new Date(dateValue).toLocaleString();
};

const categories = { value: { name: 'CPU Usage', color: '#22c55e' } };

const tooltipTitleFormatter = (_title: string, item: { i: number }) => {
  const point = series.value[item.i];
  if (!point || !point.timestamp) {
    return '';
  }
  return new Date(point.timestamp).toLocaleString();
};
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">CPU Usage</p>
        <p class="text-sm font-semibold">{{ host }}</p>
      </div>
    </div>
    <div class="mt-4">
      <LineChart
        :data="series"
        index="timestamp"
        :categories="categories"
        :y-formatter="(val: number) => `${val.toFixed(1)} %`"
        :x-formatter="xFormatter"
        :tooltip-formatter="(val: number) => `${val.toFixed(1)} %`"
        :tooltip-label-formatter="tooltipTitleFormatter"
        :curve-type="CurveType.MonotoneX"
        :show-grid-lines="false"
        :show-legend="false"
      />
    </div>
  </UCard>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}
</style>
