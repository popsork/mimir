<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
const container = computed(() => route.params.container as string);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ container }}</h2>
        <p class="text-xs text-muted">{{ host }} · docker · History</p>
      </div>
      <MetricsTimeWindowSelector />
    </div>

    <ContainersContainerHistory :host="host" :container="container" type="docker" />
  </div>
</template>
