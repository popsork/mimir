<script setup lang="ts">
const props = defineProps<{
  host: string;
  device: string;
  label?: string;
}>();

const { formatDurationSeconds, formatUnixSeconds, formatNumber, formatTime } = useMetricsFormatting();
const metricStore = useMetricsStore();

const load1 = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'load1'));
const load5 = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'load5'));
const load15 = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'load15'));
const uptime = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'uptime'));
const bootTime = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'boot_time'));
const processes = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, 'processes'));

const updatedAt = computed(() => {
  return load1.value?.timestamp
    || load5.value?.timestamp
    || load15.value?.timestamp
    || uptime.value?.timestamp
    || bootTime.value?.timestamp
    || processes.value?.timestamp
    || null;
});

const displayLabel = computed(() => props.label || 'System');
</script>

<template>
  <UCard class="system-card">
    <div class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-muted">
            {{ displayLabel }}
          </p>
          <p class="text-sm font-semibold">System Status</p>
        </div>
        <p class="text-xs text-muted">Updated {{ formatTime(updatedAt) }}</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="system-stat">
          <p class="text-xs text-muted">Load (1/5/15)</p>
          <p class="text-base font-semibold">
            {{ formatNumber(load1?.value ?? null, 2) }} · {{ formatNumber(load5?.value ?? null, 2) }} · {{ formatNumber(load15?.value ?? null, 2) }}
          </p>
        </div>
        <div class="system-stat">
          <p class="text-xs text-muted">Uptime</p>
          <p class="text-base font-semibold">{{ formatDurationSeconds(uptime?.value ?? null) }}</p>
        </div>
        <div class="system-stat">
          <p class="text-xs text-muted">Boot Time</p>
          <p class="text-base font-semibold">{{ formatUnixSeconds(bootTime?.value ?? null) }}</p>
        </div>
        <div class="system-stat">
          <p class="text-xs text-muted">Processes</p>
          <p class="text-base font-semibold">{{ formatNumber(processes?.value ?? null, 0) }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.system-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}

.system-stat {
  border-radius: 12px;
  padding: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg) 92%, var(--ui-text) 8%);
}
</style>
