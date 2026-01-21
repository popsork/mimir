<script setup lang="ts">
import { CurveType } from '@unovis/ts';

type Category = {
  name: string;
  color: string;
};

const props = defineProps<{
  title: string;
  subtitle?: string;
  series: Array<Record<string, number | string>>;
  categories: Record<string, Category>;
  yFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
}>();

const xFormatter = (value: number, index?: number) => {
  const dateValue = typeof index === 'number' ? props.series[index]?.timestamp : value;
  if (!dateValue) {
    return '';
  }
  return new Date(dateValue).toLocaleString();
};

const tooltipTitleFormatter = (_title: string, item: { i: number }) => {
  const point = props.series[item.i];
  if (!point?.timestamp) {
    return '';
  }
  return new Date(point.timestamp).toLocaleString();
};
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">{{ title }}</p>
        <p v-if="subtitle" class="text-sm font-semibold">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="series.length" class="mt-4">
      <LineChart
        :data="series"
        index="timestamp"
        :categories="categories"
        :y-formatter="yFormatter"
        :x-formatter="xFormatter"
        :tooltip-formatter="tooltipFormatter || yFormatter"
        :tooltip-label-formatter="tooltipTitleFormatter"
        :curve-type="CurveType.MonotoneX"
        :show-grid-lines="false"
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
