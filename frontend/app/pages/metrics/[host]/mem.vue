<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricsMetricUsageGauge :host="host" device="mem"/>
  </div>

  <MetricsChartsHistory :host="host" device="mem" metrics="usage" title="Memory history" />
</template>

<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<style scoped lang="scss">

</style>
