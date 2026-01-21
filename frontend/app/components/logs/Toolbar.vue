<script setup lang="ts">
import { useLogsStore } from '../../stores/logs/list';

const logsStore = useLogsStore();
const { query, from, to, loading } = storeToRefs(logsStore);

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
        <UInput v-model="from" type="datetime-local" aria-label="Start time" />
        <UInput v-model="to" type="datetime-local" aria-label="End time" />
        <UButton size="sm" :loading="loading" @click="refresh">Search</UButton>
      </div>
    </div>
  </UCard>
</template>
