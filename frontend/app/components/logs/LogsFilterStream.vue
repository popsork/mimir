<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { streams, selectedStreams } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Stream" :items="streams" v-model="selectedStreams" search-placeholder="Search streams" />
</template>
