<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<template>
  <div class="space-y-6">
    <MetricsSectionsHostSection :host="host" />
  </div>
</template>
