<script setup lang="ts">
import { mergeSeries } from '~/utils/metricsSeries';
import { useMetricsSeriesStore } from '~/stores/metrics/series';

const props = defineProps<{
  host: string;
  device: string;
}>();

const { formatNumber, formatValue } = useMetricsFormatting();
const { windowMinutes } = useTimeWindow();
const seriesStore = useMetricsSeriesStore();

const series = computed(() => seriesStore.seriesFor(props.host, props.device));
const loading = computed(() => seriesStore.loadingFor(props.host, props.device));

watch([() => props.host, () => props.device, windowMinutes], () => {
  seriesStore.fetchSeries({
    host: props.host,
    device: props.device,
    metrics: ['usage', 'temp', 'power', 'vram_used', 'vram_total'],
  });
}, { immediate: true });

const usageSeries = computed(() => mergeSeries({ usage: series.value.usage ?? [] }));
const tempSeries = computed(() => mergeSeries({ temp: series.value.temp ?? [] }));
const powerSeries = computed(() => mergeSeries({ power: series.value.power ?? [] }));

const vramSeries = computed(() => {
  const merged = mergeSeries({
    used: series.value.vram_used ?? [],
    total: series.value.vram_total ?? [],
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
    <MetricsChartsLineCard
      title="GPU Usage"
      :subtitle="host"
      :series="usageSeries"
      :categories="usageCategories"
      :y-formatter="usageFormatter"
    />
    <MetricsChartsLineCard
      title="GPU Temperature"
      :subtitle="host"
      :series="tempSeries"
      :categories="tempCategories"
      :y-formatter="tempFormatter"
    />
    <MetricsChartsLineCard
      title="GPU Power"
      :subtitle="host"
      :series="powerSeries"
      :categories="powerCategories"
      :y-formatter="powerFormatter"
    />
    <MetricsChartsLineCard
      title="VRAM Usage"
      :subtitle="host"
      :series="vramSeries"
      :categories="vramCategories"
      :y-formatter="vramFormatter"
    />
  </div>
</template>
