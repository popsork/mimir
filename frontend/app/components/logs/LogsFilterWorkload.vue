<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { workloads, selectedWorkloads } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Workload" :items="workloads" v-model="selectedWorkloads" search-placeholder="Search workloads" />
</template>
