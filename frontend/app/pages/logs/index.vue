<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';
import { useLogsStore } from '../../stores/logs/list';
import { DEFAULT_LOGS_TIME_RANGE_PRESET } from '../../utils/logsTimeRangePresets';

const filtersStore = useLogsFiltersStore();
const logsStore = useLogsStore();
let filtersInitialized = false;

useLogsQuerySync();

onMounted(async () => {
  if (!logsStore.rangePreset && !logsStore.from && !logsStore.to) {
    logsStore.rangePreset = DEFAULT_LOGS_TIME_RANGE_PRESET;
  }

  await filtersStore.load({
    rangePreset: logsStore.rangePreset,
    from: logsStore.from,
    to: logsStore.to,
  });
  await logsStore.fetchLogs();
  filtersInitialized = true;
});

watch(
  () => [logsStore.rangePreset, logsStore.from, logsStore.to],
  (next, prev) => {
    if (!filtersInitialized) return;
    if (next.join('|') === prev?.join('|')) return;
    void filtersStore.load({
      rangePreset: logsStore.rangePreset,
      from: logsStore.from,
      to: logsStore.to,
    });
  }
);
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
