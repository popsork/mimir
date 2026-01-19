<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number | null;
  unit: string | null;
  timestamp: string | null;
}>();

const { formatValue, gaugePercent, gaugeTone, formatTime } = useMetricsFormatting();

const metric = computed(() => ({
  value: props.value,
  unit: props.unit,
}));
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ label }}
        </p>
        <p class="text-lg font-semibold">
          {{ formatValue(value, unit) }}
        </p>
      </div>
      <div
        class="gauge"
        :class="`gauge--${gaugeTone(metric)}`"
        :style="{ '--gauge': `${gaugePercent(metric)}%` }"
      >
        <span class="gauge__value">{{ gaugePercent(metric) }}%</span>
      </div>
    </div>
    <div class="mt-3 space-y-1">
      <slot name="meta" />
      <p class="text-xs text-muted">
        Updated {{ formatTime(timestamp) }}
      </p>
    </div>
  </UCard>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}

.gauge {
  --gauge: 0%;
  --gauge-track: color-mix(in oklab, var(--ui-text) 15%, transparent);
  --gauge-bg: var(--ui-bg);
  --gauge-color: var(--ui-primary);
  position: relative;
  height: 64px;
  width: 64px;
  border-radius: 999px;
  background: conic-gradient(var(--gauge-color) var(--gauge), var(--gauge-track) 0);
  display: grid;
  place-items: center;
}

.gauge::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 999px;
  background: var(--gauge-bg);
}

.gauge__value {
  position: relative;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ui-text);
}

.gauge--success {
  --gauge-color: #22c55e;
}

.gauge--warning {
  --gauge-color: #f97316;
}

.gauge--danger {
  --gauge-color: #ef4444;
}

.gauge--neutral {
  --gauge-color: #64748b;
}

@media (max-width: 640px) {
  .gauge {
    height: 56px;
    width: 56px;
  }
}
</style>
