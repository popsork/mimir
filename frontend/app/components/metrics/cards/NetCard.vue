<script setup lang="ts">
const props = defineProps<{
  host: string;
  device: string;
  label?: string;
}>();

const { formatValue, formatNumber, formatTime } = useMetricsFormatting();
const metricStore = useMetricsStore();

const bytesIn = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'bytes_in'));
const bytesOut = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'bytes_out'));
const packetsIn = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'packets_in'));
const packetsOut = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'packets_out'));
const errorsIn = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'errors_in'));
const errorsOut = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'errors_out'));
const dropsIn = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'drops_in'));
const dropsOut = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'drops_out'));

const updatedAt = computed(() => {
  const timestamps = [
    bytesIn.value?.timestamp,
    bytesOut.value?.timestamp,
    packetsIn.value?.timestamp,
    packetsOut.value?.timestamp,
    errorsIn.value?.timestamp,
    errorsOut.value?.timestamp,
    dropsIn.value?.timestamp,
    dropsOut.value?.timestamp,
  ].filter(Boolean);
  if (!timestamps.length) {
    return null;
  }
  return timestamps.sort().at(-1) ?? null;
});

const displayLabel = computed(() => props.label || 'Network');
</script>

<template>
  <UCard class="metric-card">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted">
          {{ displayLabel }}
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
