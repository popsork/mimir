<script setup lang="ts">
type OverviewMetric = {
  value: number | null;
  timestamp: string | null;
};

type ContainerOverviewItem = {
  name: string;
  status: boolean | null;
  cpu: OverviewMetric | null;
  mem: OverviewMetric | null;
  uptime: OverviewMetric | null;
};

const props = defineProps<{
  host: string;
  type: 'docker' | 'proxmox';
  total: number;
  running: number;
  items: ContainerOverviewItem[];
}>();

const { formatDurationSeconds, formatValue, formatTime, normalizePercent } = useMetricsFormatting();

const rows = computed(() => props.items.map(item => {
  const cpu = item.cpu?.value ?? null;
  const mem = item.mem?.value ?? null;
  return {
    name: item.name,
    status: item.status === true ? 'Running' : item.status === false ? 'Stopped' : 'Unknown',
    cpu: cpu === null ? '—' : `${normalizePercent(cpu).toFixed(1)} %`,
    mem: mem === null ? '—' : `${normalizePercent(mem).toFixed(1)} %`,
    uptime: item.uptime?.value ? formatDurationSeconds(item.uptime.value) : '—',
    updated: item.cpu?.timestamp || item.mem?.timestamp || item.uptime?.timestamp || null,
  };
}));
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

    <UCard>
      <UTable
        :data="rows"
        :columns="[
          { accessorKey: 'name', header: 'Container' },
          { accessorKey: 'status', header: 'Status' },
          { accessorKey: 'cpu', header: 'CPU' },
          { accessorKey: 'mem', header: 'Memory' },
          { accessorKey: 'uptime', header: 'Uptime' },
          { accessorKey: 'updated', header: 'Updated' },
        ]"
      >
        <template #updated-cell="{ row }">
          <span class="text-xs text-muted">{{ row.original.updated ? formatTime(row.original.updated) : '—' }}</span>
        </template>
        <template #status-cell="{ row }">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="row.original.status === 'Running' ? 'bg-emerald-500/15 text-emerald-500' : row.original.status === 'Stopped' ? 'bg-rose-500/15 text-rose-500' : 'bg-muted/20 text-muted'"
          >
            {{ row.original.status }}
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
