<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useLogsStore } from '../../stores/logs/list';

type LogRow = {
  timestamp: string | null;
  level?: string | null;
  message: string;
  container?: string | null;
  stream?: string | null;
};

const columns: TableColumn<LogRow>[] = [
  { accessorKey: 'timestamp', header: 'Timestamp' },
  { accessorKey: 'level', header: 'Level' },
  { accessorKey: 'message', header: 'Message' },
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
