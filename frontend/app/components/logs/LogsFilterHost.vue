<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { hosts, selectedHosts } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Host" :items="hosts" v-model="selectedHosts" search-placeholder="Search hosts" />
</template>
