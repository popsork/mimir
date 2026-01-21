<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';
import { useLogsStore } from '../../stores/logs/list';

const filtersStore = useLogsFiltersStore();
const logsStore = useLogsStore();

useLogsQuerySync();

onMounted(async () => {
  await filtersStore.load();
  await logsStore.fetchLogs();
});
</script>

<template>
  <UPage>
    <template #left>
      <UPageAside>
        <LogsFiltersPanel />
      </UPageAside>
    </template>

    <UPageBody>
      <div class="space-y-4">
        <LogsToolbar />
        <LogsTable />
      </div>
    </UPageBody>
  </UPage>
</template>
