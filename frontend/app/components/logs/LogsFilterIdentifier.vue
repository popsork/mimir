<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { identifiers, selectedIdentifiers } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Identifier" :items="identifiers" v-model="selectedIdentifiers" search-placeholder="Search identifiers" />
</template>
