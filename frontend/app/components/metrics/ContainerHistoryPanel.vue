<script setup lang="ts">
import { mergeSeries, toRateSeries } from '../../utils/metricsSeries';

type SeriesPoint = {
  timestamp: string | null;
  value: number | null;
};

const props = defineProps<{
  host: string;
  container: string;
  series: Record<string, SeriesPoint[]>;
}>();

const { formatNumber, formatValue, formatDurationSeconds, normalizePercent } = useMetricsFormatting();

const cpuSeries = computed(() => mergeSeries({ cpu: props.series.cpu_usage_pct ?? [] }));

const memUsageSeries = computed(() => {
  if ((props.series.mem_usage_pct ?? []).length) {
    return mergeSeries({ mem: props.series.mem_usage_pct ?? [] });
  }

  const merged = mergeSeries({
    used: props.series.mem_used_bytes ?? [],
    total: props.series.mem_limit_bytes ?? [],
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

const netSeries = computed(() => {
  const rx = toRateSeries(props.series.net_rx_bytes ?? []);
  const tx = toRateSeries(props.series.net_tx_bytes ?? []);
  return mergeSeries({ rx, tx });
});

const statusSeries = computed(() => mergeSeries({ status: props.series.status ?? [] }));
const uptimeSeries = computed(() => mergeSeries({ uptime: props.series.uptime_seconds ?? [] }));

const cpuCategories = { cpu: { name: 'CPU %', color: '#22c55e' } };
const memCategories = { mem: { name: 'Mem %', color: '#38bdf8' } };
const netCategories = {
  rx: { name: 'RX', color: '#22c55e' },
  tx: { name: 'TX', color: '#f97316' },
};
const statusCategories = { status: { name: 'Status', color: '#f97316' } };
const uptimeCategories = { uptime: { name: 'Uptime', color: '#a855f7' } };

const percentFormatter = (value: number) => `${formatNumber(normalizePercent(value), 1)} %`;
const bytesPerSecondFormatter = (value: number) => `${formatValue(value, 'bytes')}/s`;
const statusAxisFormatter = (value: number) => (value >= 1 ? '1' : '0');
const statusTooltipFormatter = (value: number) => (value >= 1 ? 'Running' : 'Stopped');
const uptimeFormatter = (value: number) => formatDurationSeconds(value);
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <MetricsLineChartCard
        title="Container CPU Usage"
        :subtitle="`${container} · ${host}`"
        :series="cpuSeries"
        :categories="cpuCategories"
        :y-formatter="percentFormatter"
      />
      <MetricsLineChartCard
        title="Container Memory Usage"
        :subtitle="`${container} · ${host}`"
        :series="memUsageSeries"
        :categories="memCategories"
        :y-formatter="percentFormatter"
      />
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <MetricsLineChartCard
        title="Container Network Throughput"
        :subtitle="`${container} · ${host}`"
        :series="netSeries"
        :categories="netCategories"
        :y-formatter="bytesPerSecondFormatter"
      />
      <MetricsLineChartCard
        title="Container Status"
        :subtitle="`${container} · ${host}`"
        :series="statusSeries"
        :categories="statusCategories"
        :y-formatter="statusAxisFormatter"
        :tooltip-formatter="statusTooltipFormatter"
      />
    </div>
    <MetricsLineChartCard
      title="Container Uptime"
      :subtitle="`${container} · ${host}`"
      :series="uptimeSeries"
      :categories="uptimeCategories"
      :y-formatter="uptimeFormatter"
      :tooltip-formatter="uptimeFormatter"
    />
  </div>
</template>
