<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useLogsStore } from '../../stores/logs/list';

type LogRow = {
  timestamp: string | null;
  level?: string | null;
  message: string;
  workload?: string | null;
  identifier?: string | null;
  host?: string | null;
  container?: string | null;
  stream?: string | null;
};

const columns: TableColumn<LogRow>[] = [
  { accessorKey: 'timestamp', header: 'Timestamp' },
  { accessorKey: 'level', header: 'Level' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'workload', header: 'Workload' },
  { accessorKey: 'identifier', header: 'Identifier' },
  { accessorKey: 'host', header: 'Host' },
  { accessorKey: 'container', header: 'Container' },
  { accessorKey: 'stream', header: 'Stream' }
];

const logsStore = useLogsStore();
const { records, loading } = storeToRefs(logsStore);

const formatTimestamp = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const rows = computed(() => records.value.map((record) => ({
  ...record,
  timestamp: formatTimestamp(record.timestamp),
})) as LogRow[]);
</script>

<template>
  <UCard>
    <UTable :columns="columns" :data="rows" :loading="loading" />
  </UCard>
</template>
