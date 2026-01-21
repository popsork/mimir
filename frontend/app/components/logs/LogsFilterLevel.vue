<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { levels, selectedLevels } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Level" :items="levels" v-model="selectedLevels" search-placeholder="Search levels" />
</template>
