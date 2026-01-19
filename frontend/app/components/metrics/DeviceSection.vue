<script setup lang="ts">
type DeviceMetric = {
  label: string;
  metric: string;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
};

const props = defineProps<{
  label: string;
  device?: string;
  metrics: DeviceMetric[];
}>();

const deviceKey = computed(() => (props.device || '').toLowerCase());
const isMemory = computed(() => deviceKey.value === 'mem' || props.label.toLowerCase() === 'memory');
const isSystem = computed(() => deviceKey.value === 'system');
const isDisk = computed(() => deviceKey.value === 'disk');
const isSwap = computed(() => deviceKey.value === 'swap');
const isNet = computed(() => deviceKey.value === 'net');
const isDiskIo = computed(() => deviceKey.value === 'diskio');
const isFan = computed(() => deviceKey.value === 'fan');
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold">{{ label }}</h3>
        <p class="text-xs text-muted">
          {{ metrics.length }} signals
        </p>
      </div>
    </div>

    <div v-if="isSystem" class="w-full">
      <MetricsSystemCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isDisk" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsDiskCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isSwap" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsSwapCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isNet" class="w-full">
      <MetricsNetCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isDiskIo" class="w-full">
      <MetricsDiskIoCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isFan" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsFanCard :label="label" :metrics="metrics" />
    </div>
    <div v-else-if="isMemory" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsMemoryCard :label="label" :metrics="metrics" />
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsGaugeCard
        v-for="metric in metrics"
        :key="`${metric.metric}-${metric.unit || 'none'}`"
        :label="`${label} ${metric.label}`"
        :value="metric.value"
        :unit="metric.unit"
        :timestamp="metric.timestamp"
      />
    </div>
  </div>
</template>
