<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricsMetricGauge :host="host" device="gpu0" metric="usage"/>
    <MetricsMetricGauge :host="host" device="gpu0" metric="temp"/>
  </div>

  <MetricsChartsGpuHistory :host="host" device="gpu0" />
</template>

<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<style scoped lang="scss">

</style>
