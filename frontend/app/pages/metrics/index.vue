<script setup lang="ts">
import { useMetricsOverviewStore } from '../../stores/metricsOverview';
import { useMetricsStore } from '../../stores/metrics';

definePageMeta({
  layout: 'metrics',
});

const metricsStore = useMetricsStore();
const overviewStore = useMetricsOverviewStore();

const { loading, error, cpuRows, memoryRows, diskRows } = storeToRefs(overviewStore);
const { hosts, error: metricsError, loading: metricsLoading } = storeToRefs(metricsStore);
</script>

<template>
  <div class="space-y-6">
    <UCard v-if="metricsLoading">
      <p class="text-sm text-muted">Loading metrics...</p>
    </UCard>

    <UCard v-else-if="metricsError && !hosts.length">
      <p class="text-sm text-red-600">{{ metricsError }}</p>
    </UCard>

    <UCard v-else-if="!hosts.length">
      <p class="text-sm text-muted">No recent metrics found in this window.</p>
    </UCard>

    <UCard v-else-if="loading">
      <p class="text-sm text-muted">Loading overview...</p>
    </UCard>

    <UCard v-else-if="error">
      <p class="text-sm text-red-600">{{ error }}</p>
    </UCard>

    <div v-else class="space-y-8">
      <section class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold">CPU Usage</h2>
          <p class="text-xs text-muted">Right now, by host.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricsGaugeCard
            v-for="row in cpuRows"
            :key="`cpu-${row.id}`"
            :label="row.label"
            :value="row.value"
            unit="pct"
            :timestamp="row.timestamp"
          />
        </div>
      </section>

      <section class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold">Memory</h2>
          <p class="text-xs text-muted">Usage percent by host.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricsGaugeCard
            v-for="row in memoryRows"
            :key="`mem-${row.id}`"
            :label="row.label"
            :value="row.value"
            unit="pct"
            :timestamp="row.timestamp"
          />
        </div>
      </section>

      <section class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold">Disk</h2>
          <p class="text-xs text-muted">Usage percent by host.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricsGaugeCard
            v-for="row in diskRows"
            :key="`disk-${row.id}`"
            :label="row.label"
            :value="row.value"
            unit="pct"
            :timestamp="row.timestamp"
          />
        </div>
      </section>
    </div>
  </div>
</template>
