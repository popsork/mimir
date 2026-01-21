<script setup lang="ts">
import { useLogsFiltersStore } from '../../stores/logs/filters';

const filtersStore = useLogsFiltersStore();
const { images, selectedImages } = storeToRefs(filtersStore);
</script>

<template>
  <LogsFilterGroup label="Image" :items="images" v-model="selectedImages" search-placeholder="Search images" />
</template>
