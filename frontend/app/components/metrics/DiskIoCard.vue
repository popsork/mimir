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

const readBytes = computed(() => getMetric('read_bytes'));
const writeBytes = computed(() => getMetric('write_bytes'));
const readOps = computed(() => getMetric('read_ops'));
const writeOps = computed(() => getMetric('write_ops'));
const readTime = computed(() => getMetric('read_time_ms'));
const writeTime = computed(() => getMetric('write_time_ms'));
const ioTime = computed(() => getMetric('io_time_ms'));

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
        <p class="text-sm font-semibold">Disk IO Totals</p>
      </div>
      <p class="text-xs text-muted">Updated {{ formatTime(updatedAt) }}</p>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="stat">
        <p class="text-xs text-muted">Read</p>
        <p class="text-base font-semibold">{{ formatValue(readBytes?.value ?? null, 'bytes') }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Write</p>
        <p class="text-base font-semibold">{{ formatValue(writeBytes?.value ?? null, 'bytes') }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Read Ops</p>
        <p class="text-base font-semibold">{{ formatNumber(readOps?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Write Ops</p>
        <p class="text-base font-semibold">{{ formatNumber(writeOps?.value ?? null, 0) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Read Time</p>
        <p class="text-base font-semibold">{{ formatNumber(readTime?.value ?? null, 0) }} ms</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">Write Time</p>
        <p class="text-base font-semibold">{{ formatNumber(writeTime?.value ?? null, 0) }} ms</p>
      </div>
      <div class="stat">
        <p class="text-xs text-muted">IO Time</p>
        <p class="text-base font-semibold">{{ formatNumber(ioTime?.value ?? null, 0) }} ms</p>
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
