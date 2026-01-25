<script setup lang="ts">
import { useContainersOverviewStore } from '~/stores/containers/overview';

const props = defineProps<{
  host: string;
  type: 'docker' | 'proxmox';
}>();

const { formatDurationSeconds, formatTime, normalizePercent } = useMetricsFormatting();
const overviewStore = useContainersOverviewStore();

const { items, total, running, loading, error } = storeToRefs(overviewStore);

watch([() => props.host, () => props.type], () => {
  overviewStore.fetchOverview({
    host: props.host,
    type: props.type,
  });
}, { immediate: true });

const rows = computed(() => items.value.map((item: any) => {
  const cpu = item.cpu?.value ?? null;
  const mem = item.mem?.value ?? null;
  return {
    name: item.name,
    status: item.status === true ? 'Running' : item.status === false ? 'Stopped' : 'Unknown',
    statusValue: item.status,
    cpu: cpu === null ? '—' : `${normalizePercent(cpu).toFixed(1)} %`,
    mem: mem === null ? '—' : `${normalizePercent(mem).toFixed(1)} %`,
    uptime: item.uptime?.value ? formatDurationSeconds(item.uptime.value) : '—',
    updated: item.cpu?.timestamp || item.mem?.timestamp || item.uptime?.timestamp || null,
  };
}));

const columns: any[] = [
  { key: 'name', label: 'Container' },
  { key: 'status', label: 'Status' },
  { key: 'cpu', label: 'CPU' },
  { key: 'mem', label: 'Memory' },
  { key: 'uptime', label: 'Uptime' },
  { key: 'updated', label: 'Updated' },
];
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">{{ type }}</p>
          <p class="text-lg font-semibold">{{ host }}</p>
        </div>
        <div class="flex gap-6">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-muted">Total</p>
            <p class="text-sm font-semibold">{{ total }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-muted">Running</p>
            <p class="text-sm font-semibold">{{ running }}</p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="loading" class="text-center text-muted">
      Loading containers...
    </UCard>
    <UCard v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </UCard>
    <UCard v-else>
      <UTable :columns="columns" :rows="rows">
        <template #status-data="{ row }">
          <UBadge
            :color="(row as any).statusValue === true ? 'success' : (row as any).statusValue === false ? 'error' : 'neutral'"
          >
            {{ (row as any).status }}
          </UBadge>
        </template>
        <template #updated-data="{ row }">
          <span class="text-xs text-muted">{{ (row as any).updated ? formatTime((row as any).updated) : '—' }}</span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
