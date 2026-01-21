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
const rows = computed(() => records.value as LogRow[]);
</script>

<template>
  <UCard>
    <UTable :columns="columns" :data="rows" :loading="loading" />
  </UCard>
</template>
