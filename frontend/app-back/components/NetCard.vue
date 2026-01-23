<script setup lang="ts">
type MetricSample = {
  metric: string;
  label: string;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
};

const props = defineProps<{
  label: string;
  metrics: MetricSample[];
}>();

const { formatValue, formatNumber, formatTime } = useMetricsFormatting();

const getMetric = (name: string) => props.metrics.find(metric => metric.metric === name);

const bytesIn = computed(() => getMetric('bytes_in'));
const bytesOut = computed(() => getMetric('bytes_out'));
const packetsIn = computed(() => getMetric('packets_in'));
const packetsOut = computed(() => getMetric('packets_out'));
const errorsIn = computed(() => getMetric('errors_in'));
const errorsOut = computed(() => getMetric('errors_out'));
const dropsIn = computed(() => getMetric('drops_in'));
const dropsOut = computed(() => getMetric('drops_out'));

const updatedAt = computed(() => {
  const timestamps = props.metrics.map(metric => metric.timestamp).filter(Boolean);
  if (!timestamps.length) {
    return null;
  }
  return timestamps.sort().at(-1) ?? null;
});
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ label }}
        </p>
        <p class="text-sm font-semibold">Network Totals</p>
      </div>
      <p class="text-xs text-muted">Updated {{ formatTime(updatedAt) }}</p>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="stat">
        <p class="text-xs text-muted">Bytes In</p>
        <p class="text-base font-semibold">{{ formatValue(bytesIn?.value ?? null, 'bytes') }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Bytes Out</p>
        <p class="text-base font-semibold">{{ formatValue(bytesOut?.value ?? null, 'bytes') }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Packets In</p>
        <p class="text-base font-semibold">{{ formatNumber(packetsIn?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Packets Out</p>
        <p class="text-base font-semibold">{{ formatNumber(packetsOut?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Errors In</p>
        <p class="text-base font-semibold">{{ formatNumber(errorsIn?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Errors Out</p>
        <p class="text-base font-semibold">{{ formatNumber(errorsOut?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Drops In</p>
        <p class="text-base font-semibold">{{ formatNumber(dropsIn?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Drops Out</p>
        <p class="text-base font-semibold">{{ formatNumber(dropsOut?.value ?? null, 0) }}</p>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}

.stat {
  border-radius: 12px;
  padding: 1rem;
  background: color-mix(in oklab, var(--ui-bg) 92%, var(--ui-text) 8%);
}
</style>
