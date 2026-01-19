<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="orders-list")
</template>
<script setup lang="ts">

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const listViewsStore = useOrdersListViewsStore();
const { views } = storeToRefs(listViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss">
</style>
