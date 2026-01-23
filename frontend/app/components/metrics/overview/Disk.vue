<script setup lang="ts">
const metricsStore = useMetricsStore();
const { hosts } = storeToRefs(metricsStore);
</script>

<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-lg font-semibold">Disk Usage</h2>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricsMetricUsageGauge v-for="host in hosts" :label="host" :host="host" device="disk" />
    </div>
  </section>

</template>

<style scoped lang="scss">

</style>
