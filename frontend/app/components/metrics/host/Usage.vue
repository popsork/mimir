<script setup lang="ts">
defineProps<{
  host: string,
}>();
</script>

<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-lg font-semibold">Usage</h2>
    </div>
    <div class="grid gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      <MetricsMetricGauge :host="host" device="cpu" metric="usage" />
      <MetricsMetricGauge :host="host" device="gpu0" metric="usage" />
      <MetricsMetricUsageGauge :host="host" device="mem" />
      <MetricsMetricUsageGauge :host="host" device="disk" />
      <MetricsMetricUsageGauge :host="host" device="swap" />
    </div>
  </section>
</template>

<style scoped lang="scss">

</style>
