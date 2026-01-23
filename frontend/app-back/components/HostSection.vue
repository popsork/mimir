<script setup lang="ts">
type DeviceMetrics = {
  device: string;
  label: string;
  metrics: Array<{
    label: string;
    metric: string;
    unit: string | null;
    value: number | null;
    timestamp: string | null;
  }>;
};

defineProps<{
  host: string;
  devices: DeviceMetrics[];
}>();
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ host }}</h2>
        <p class="text-xs text-muted">
          {{ devices.reduce((sum, device) => sum + device.metrics.length, 0) }} live gauges
        </p>
      </div>
    </div>

    <div class="space-y-6">
      <MetricsDeviceSection
        v-for="device in devices"
        :key="`${host}-${device.device}`"
        :device="device.device"
        :label="device.label"
        :metrics="device.metrics"
      />
    </div>
  </section>
</template>
