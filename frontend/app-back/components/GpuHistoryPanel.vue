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

const { formatNumber, formatValue } = useMetricsFormatting();

const usageSeries = computed(() => mergeSeries({ usage: props.series.usage ?? [] }));
const tempSeries = computed(() => mergeSeries({ temp: props.series.temp ?? [] }));
const powerSeries = computed(() => mergeSeries({ power: props.series.power ?? [] }));

const vramSeries = computed(() => {
  const merged = mergeSeries({
    used: props.series.vram_used ?? [],
    total: props.series.vram_total ?? [],
  });
  return merged
    .map(point => {
      const used = typeof point.used === 'number' ? point.used : 0;
      const total = typeof point.total === 'number' ? point.total : 0;
      if (!total) {
        return null;
      }
      return {
        timestamp: point.timestamp as string,
        value: (used / total) * 100,
      };
    })
    .filter(Boolean) as Array<{ timestamp: string; value: number }>;
});

const usageCategories = {
  usage: { name: 'GPU Usage', color: '#22c55e' },
};
const tempCategories = {
  temp: { name: 'GPU Temp', color: '#f97316' },
};
const powerCategories = {
  power: { name: 'GPU Power', color: '#38bdf8' },
};
const vramCategories = {
  value: { name: 'VRAM Usage', color: '#a855f7' },
};

const usageFormatter = (value: number) => `${formatNumber(value, 1)} %`;
const tempFormatter = (value: number) => `${formatNumber(value, 1)} C`;
const powerFormatter = (value: number) => `${formatNumber(value, 1)} W`;
const vramFormatter = (value: number) => `${formatValue(value, 'pct')}`;
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <MetricsLineChartCard
      title="GPU Usage"
      :subtitle="host"
      :series="usageSeries"
      :categories="usageCategories"
      :y-formatter="usageFormatter"
    />
    <MetricsLineChartCard
      title="GPU Temperature"
      :subtitle="host"
      :series="tempSeries"
      :categories="tempCategories"
      :y-formatter="tempFormatter"
    />
    <MetricsLineChartCard
      title="GPU Power"
      :subtitle="host"
      :series="powerSeries"
      :categories="powerCategories"
      :y-formatter="powerFormatter"
    />
    <MetricsLineChartCard
      title="VRAM Usage"
      :subtitle="host"
      :series="vramSeries"
      :categories="vramCategories"
      :y-formatter="vramFormatter"
    />
  </div>
</template>
