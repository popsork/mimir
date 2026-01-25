<script setup lang="ts">
const props = defineProps<{
  host: string;
  device: string;
  label?: string;
}>();

const { formatValue, gaugePercent, gaugeTone, formatTime } = useMetricsFormatting();
const metricStore = useMetricsStore();

const usageMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'usage'));
const usedMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'used'));
const totalMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'total'));

const derivedUsage = computed(() => {
  if (usageMetric.value?.value !== null && usageMetric.value?.value !== undefined) {
    return usageMetric.value.value;
  }
  if (usedMetric.value?.value !== null && totalMetric.value?.value) {
    return ((usedMetric.value?.value ?? 0) / totalMetric.value.value) * 100;
  }
  return null;
});

const usageTimestamp = computed(() => {
  return usageMetric.value?.timestamp
    || usedMetric.value?.timestamp
    || totalMetric.value?.timestamp
    || null;
});

const gaugeMetric = computed(() => ({
  value: derivedUsage.value,
  unit: 'pct',
}));

const displayLabel = computed(() => props.label || 'Swap');
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ displayLabel }} Usage
        </p>
        <p class="text-lg font-semibold">
          {{ derivedUsage === null ? '—' : `${derivedUsage.toFixed(1)} %` }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ formatValue(usedMetric?.value ?? null, 'bytes') }} / {{ formatValue(totalMetric?.value ?? null, 'bytes') }}
        </p>
      </div>
      <div
        class="gauge"
        :class="`gauge--${gaugeTone(gaugeMetric)}`"
        :style="{ '--gauge': `${gaugePercent(gaugeMetric)}%` }"
      >
        <span class="gauge__value">{{ gaugePercent(gaugeMetric) }}%</span>
      </div>
    </div>
    <p class="mt-3 text-xs text-muted">
      Updated {{ formatTime(usageTimestamp) }}
    </p>
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
