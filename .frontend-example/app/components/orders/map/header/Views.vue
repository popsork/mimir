<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="orders-map")
</template>
<script setup lang="ts">
const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const mapViewsStore = useOrdersMapViewsStore();
const { views } = storeToRefs(mapViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss">
</style>
