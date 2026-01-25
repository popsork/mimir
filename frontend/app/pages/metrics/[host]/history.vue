<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ host }} History</h2>
        <p class="text-xs text-muted">Historical metrics and charts</p>
      </div>
      <MetricsTimeWindowSelector />
    </div>

    <div class="space-y-4">
      <MetricsChartsCpuHistory :host="host" device="cpu" />
      <MetricsChartsLoadHistory :host="host" device="system" />
      <MetricsChartsNetThroughput :host="host" device="net" />
      <MetricsChartsDiskUsageHistory :host="host" device="disk" />
      <MetricsChartsDiskIoHistory :host="host" device="diskio" />
    </div>
  </div>
</template>
