<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';
import { useLogsStore } from '../../stores/logs/list';

const filtersStore = useLogsFiltersStore();
const logsStore = useLogsStore();
const {
  levels,
  streams,
  hosts,
  containers,
  images,
  loggers,
  selectedLevels,
  selectedStreams,
  selectedHosts,
  selectedContainers,
  selectedImages,
  selectedLoggers,
} = storeToRefs(filtersStore);

const applyFilters = async () => {
  await logsStore.fetchLogs();
};

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

      <UFormField label="Level">
        <UCheckboxGroup v-model="selectedLevels" :items="levels" />
      </UFormField>

      <UFormField label="Stream">
        <UCheckboxGroup v-model="selectedStreams" :items="streams" />
      </UFormField>

      <UFormField label="Host">
        <UCheckboxGroup v-model="selectedHosts" :items="hosts" />
      </UFormField>

      <UFormField label="Container">
        <UCheckboxGroup v-model="selectedContainers" :items="containers" />
      </UFormField>

      <UFormField label="Image">
        <UCheckboxGroup v-model="selectedImages" :items="images" />
      </UFormField>

      <UFormField label="Logger">
        <UCheckboxGroup v-model="selectedLoggers" :items="loggers" />
      </UFormField>

      <div class="flex gap-2 pt-2">
        <UButton size="sm" @click="applyFilters">Apply</UButton>
        <UButton size="sm" variant="ghost" color="neutral" @click="resetFilters">Reset</UButton>
      </div>
    </div>
  </UCard>
</template>
