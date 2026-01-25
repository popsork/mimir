<script setup lang="ts">
const props = defineProps<{
  host: string;
  device: string;
  label?: string;
}>();

const { formatNumber, formatTime } = useMetricsFormatting();
const metricStore = useMetricsStore();

const speedMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'speed'));

const displayLabel = computed(() => props.label || 'Fan');
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ displayLabel }}
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
