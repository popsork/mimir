<script setup lang="ts">
import { useLogsStore } from '../../stores/logs/list';

const logsStore = useLogsStore();
const { query } = storeToRefs(logsStore);

const refresh = async () => {
  await logsStore.fetchLogs();
};
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search messages"
        class="lg:flex-1"
      />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <LogsTimeRangePicker />
        <UButton size="sm" @click="refresh">Search</UButton>
      </div>
    </div>
  </UCard>
</template>
