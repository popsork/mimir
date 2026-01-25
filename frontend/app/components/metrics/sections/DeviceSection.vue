<script setup lang="ts">
const props = defineProps<{
  host: string;
  device: string;
  label: string;
}>();

const deviceKey = computed(() => props.device.toLowerCase());
const isMemory = computed(() => deviceKey.value === 'mem' || props.label.toLowerCase() === 'memory');
const isSystem = computed(() => deviceKey.value === 'system');
const isDisk = computed(() => deviceKey.value === 'disk');
const isSwap = computed(() => deviceKey.value === 'swap');
const isNet = computed(() => deviceKey.value === 'net');
const isDiskIo = computed(() => deviceKey.value === 'diskio');
const isFan = computed(() => deviceKey.value === 'fan');
const isCpu = computed(() => deviceKey.value === 'cpu');
const isGpu = computed(() => deviceKey.value === 'gpu');

// For generic devices, fetch metrics to display them as individual gauges
const metricStore = useMetricsStore();
const isGeneric = computed(() => !isMemory.value && !isSystem.value && !isDisk.value && !isSwap.value && !isNet.value && !isDiskIo.value && !isFan.value && !isCpu.value && !isGpu.value);

// Get all metrics for this device for generic rendering
const deviceMetrics = computed(() => {
  if (!metricStore.data) return [];
  const hostData = metricStore.data.find(h => h.host === props.host);
  if (!hostData) return [];
  const deviceData = hostData.devices.find(d => d.device === props.device);
  return deviceData?.metrics ?? [];
});
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold">{{ label }}</h3>
      </div>
    </div>

    <div v-if="isSystem" class="w-full">
      <MetricsCardsSystemCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isDisk" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsCardsDiskCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isSwap" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsCardsSwapCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isNet" class="w-full">
      <MetricsCardsNetCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isDiskIo" class="w-full">
      <MetricsCardsDiskIoCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isFan" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsCardsFanCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else-if="isMemory" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsCardsMemoryCard :host="host" :device="device" :label="label" />
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsGaugeCard
        v-for="metric in deviceMetrics"
        :key="`${metric.metric}-${metric.unit || 'none'}`"
        :label="`${label} ${metric.metric}`"
        :value="metric.value"
        :unit="metric.unit"
        :timestamp="metric.timestamp"
      />
    </div>
  </div>
</template>
