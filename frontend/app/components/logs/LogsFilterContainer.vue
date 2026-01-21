<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { containers, selectedContainers } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Container" :items="containers" v-model="selectedContainers" search-placeholder="Search containers" />
</template>
