<template>
<MetricsChartsDiskIoHistory :host="host" device="diskio" />
</template>

<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<style scoped lang="scss">

</style>
