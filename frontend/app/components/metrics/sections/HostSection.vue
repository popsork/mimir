<script setup lang="ts">
const props = defineProps<{
  host: string;
}>();

const metricStore = useMetricsStore();

const hostData = computed(() => {
  if (!metricStore.data) return null;
  return metricStore.data.find(h => h.host === props.host);
});

const devices = computed(() => {
  if (!hostData.value) return [];
  return hostData.value.devices.map(d => ({
    device: d.device,
    label: d.device,
    metricCount: d.metrics.length,
  }));
});

const totalMetrics = computed(() => {
  return devices.value.reduce((sum, device) => sum + device.metricCount, 0);
});
</script>

<template>
  <section v-if="hostData">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ host }}</h2>
        <p class="text-xs text-muted">
          {{ totalMetrics }} live gauges
        </p>
      </div>
    </div>

    <div class="space-y-6">
      <MetricsSectionsDeviceSection
        v-for="device in devices"
        :key="`${host}-${device.device}`"
        :host="host"
        :device="device.device"
        :label="device.label"
      />
    </div>
  </section>
</template>
