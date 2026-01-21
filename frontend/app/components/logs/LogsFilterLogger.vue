<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { loggers, selectedLoggers } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Logger" :items="loggers" v-model="selectedLoggers" search-placeholder="Search loggers" />
</template>
