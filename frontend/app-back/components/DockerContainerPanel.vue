<script setup lang="ts">
type ContainerMetric = {
  metric: string;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
};

const props = defineProps<{
  host: string;
  container: string;
  type: 'docker' | 'proxmox';
  metrics: ContainerMetric[];
}>();

const { formatValue, formatDurationSeconds, formatTime } = useMetricsFormatting();

const getMetric = (name: string) => props.metrics.find(metric => metric.metric === name);

const status = computed(() => getMetric('status'));
const uptime = computed(() => getMetric('uptime_seconds'));
const cpu = computed(() => getMetric('cpu_usage_pct'));
const memUsage = computed(() => getMetric('mem_usage_pct'));
const memUsed = computed(() => getMetric('mem_used_bytes'));
const memLimit = computed(() => getMetric('mem_limit_bytes'));
const netRx = computed(() => getMetric('net_rx_bytes'));
const netTx = computed(() => getMetric('net_tx_bytes'));
const blkRead = computed(() => getMetric('blk_read_bytes'));
const blkWrite = computed(() => getMetric('blk_write_bytes'));

const updatedAt = computed(() => {
  const timestamps = props.metrics.map(metric => metric.timestamp).filter(Boolean);
  if (!timestamps.length) {
    return null;
  }
  return timestamps.sort().at(-1) ?? null;
});

const statusLabel = computed(() => {
  if (status.value?.value === null || status.value?.value === undefined) {
    return 'Unknown';
  }
  return status.value.value >= 1 ? 'Running' : 'Stopped';
});

const cpuMetric = computed(() => ({
  value: cpu.value?.value ?? null,
  unit: 'pct_raw',
}));

const memMetric = computed(() => ({
  value: (() => {
    if (memUsage.value?.value !== null && memUsage.value?.value !== undefined) {
      return memUsage.value.value;
    }
    if (memUsed.value?.value !== null && memLimit.value?.value) {
      return ((memUsed.value?.value ?? 0) / memLimit.value.value) * 100;
    }
    return null;
  })(),
  unit: 'pct_raw',
}));
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Container</p>
          <p class="text-lg font-semibold">{{ container }}</p>
          <p class="text-xs text-muted">{{ host }} · {{ type }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            :class="statusLabel === 'Running' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'"
          >
            {{ statusLabel }}
          </span>
          <p class="text-xs text-muted">Updated {{ formatTime(updatedAt) }}</p>
        </div>
      </div>
    </UCard>

    <div class="grid gap-4 lg:grid-cols-2">
      <MetricsGaugeCard
        label="CPU Usage"
        :value="cpuMetric.value"
        :unit="cpuMetric.unit"
        :timestamp="cpu?.timestamp ?? null"
      />

      <MetricsGaugeCard
        label="Memory Usage"
        :value="memMetric.value"
        :unit="memMetric.unit"
        :timestamp="memUsage?.timestamp ?? null"
      >
        <template #meta>
          <p class="text-xs text-muted">
            {{ memMetric.value === null ? '—' : `${memMetric.value.toFixed(2)} %` }}
          </p>
          <p class="text-xs text-muted">
            <span v-if="memLimit?.value">
              {{ formatValue(memUsed?.value ?? null, 'bytes') }} / {{ formatValue(memLimit?.value ?? null, 'bytes') }}
            </span>
            <span v-else>
              Used {{ formatValue(memUsed?.value ?? null, 'bytes') }}
            </span>
          </p>
        </template>
      </MetricsGaugeCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard class="metric-card">
        <p class="text-xs uppercase tracking-[0.2em] text-muted">Uptime</p>
        <p class="text-lg font-semibold">{{ formatDurationSeconds(uptime?.value ?? null) }}</p>
      </UCard>
      <UCard class="metric-card">
        <p class="text-xs uppercase tracking-[0.2em] text-muted">Network</p>
        <p class="text-sm font-semibold">
          RX {{ formatValue(netRx?.value ?? null, 'bytes') }}
        </p>
        <p class="text-sm font-semibold">
          TX {{ formatValue(netTx?.value ?? null, 'bytes') }}
        </p>
      </UCard>
      <UCard class="metric-card">
        <p class="text-xs uppercase tracking-[0.2em] text-muted">Block IO</p>
        <p class="text-sm font-semibold">
          Read {{ formatValue(blkRead?.value ?? null, 'bytes') }}
        </p>
        <p class="text-sm font-semibold">
          Write {{ formatValue(blkWrite?.value ?? null, 'bytes') }}
        </p>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}
</style>
