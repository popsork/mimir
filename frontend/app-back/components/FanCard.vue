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

const { formatNumber, formatTime } = useMetricsFormatting();

const speedMetric = computed(() => props.metrics[0]);
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ label }}
        </p>
        <p class="text-lg font-semibold">
          {{ formatNumber(speedMetric?.value ?? null, 0) }} rpm
        </p>
      </div>
    </div>
    <p class="mt-3 text-xs text-muted">
      Updated {{ formatTime(speedMetric?.timestamp ?? null) }}
    </p>
  </UCard>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}
</style>
