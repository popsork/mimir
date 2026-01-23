<script setup lang="ts">
defineProps<{
  windowMinutes: number;
  hostCount: number;
  signalCount: number;
  containerCount: number;
  runningCount: number;
  lastUpdated: string | null;
}>();

const { formatTime } = useMetricsFormatting();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] text-muted">Window</p>
        <p class="text-sm font-semibold">
          Last {{ windowMinutes }} minutes
        </p>
      </div>
      <div class="flex gap-6">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Hosts</p>
          <p class="text-sm font-semibold">{{ hostCount }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Signals</p>
          <p class="text-sm font-semibold">{{ signalCount }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Containers</p>
          <p class="text-sm font-semibold">{{ containerCount }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Running</p>
          <p class="text-sm font-semibold">{{ runningCount }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-muted">Updated</p>
          <p class="text-sm font-semibold">
            {{ lastUpdated ? formatTime(lastUpdated) : '—' }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
