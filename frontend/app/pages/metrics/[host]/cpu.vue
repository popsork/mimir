<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricsMetricGauge :host="host" device="cpu" metric="usage"/>
    <MetricsMetricGauge :host="host" device="cpu" metric="temp"/>
  </div>
  <div>
    <MetricsChartsCpuHistory :host="host" device="cpu" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<style scoped lang="scss">

</style>
