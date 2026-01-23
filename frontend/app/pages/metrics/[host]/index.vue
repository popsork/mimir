<script setup lang="ts">
const route = useRoute();

const host = computed(() => route.params.host as string);
</script>

<template>
  <div class="mb-3 flex items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold">{{ host }}</h2>
    </div>
  </div>

  <MetricsHostUsage :host="host" />
</template>

<style scoped lang="scss">

</style>
