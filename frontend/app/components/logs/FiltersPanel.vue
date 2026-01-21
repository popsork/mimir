<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';
import { useLogsStore } from '../../stores/logs/list';

const logsStore = useLogsStore();
const filtersStore = useLogsFiltersStore();

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
const triggerFetch = () => {
  if (debounceHandle) {
    clearTimeout(debounceHandle);
  }
  debounceHandle = setTimeout(() => {
    void logsStore.fetchLogs();
  }, 200);
};

watch(
  () => [
    filtersStore.selectedLevels,
    filtersStore.selectedStreams,
    filtersStore.selectedWorkloads,
    filtersStore.selectedHosts,
    filtersStore.selectedContainers,
    filtersStore.selectedImages,
    filtersStore.selectedIdentifiers,
    filtersStore.selectedLoggers,
  ].map((list) => list.join('|')).join('::'),
  () => triggerFetch(),
  { deep: false }
);

const resetFilters = async () => {
  filtersStore.reset();
  await logsStore.fetchLogs();
};
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold">Filters</h3>
        <p class="text-xs text-muted">
          Filter by metadata and log attributes.
        </p>
      </div>

      <LogsFilterLevel />
      <LogsFilterStream />
      <LogsFilterWorkload />
      <LogsFilterHost />
      <LogsFilterContainer />
      <LogsFilterImage />
      <LogsFilterIdentifier />
      <LogsFilterLogger />

      <div class="flex gap-2 pt-2">
        <UButton size="sm" variant="ghost" color="neutral" @click="resetFilters">Reset</UButton>
      </div>
    </div>
  </UCard>
</template>
