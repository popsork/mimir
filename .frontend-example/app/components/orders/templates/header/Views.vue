<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="order-templates-list")
</template>
<script setup lang="ts">

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const listViewsStore = useOrderTemplatesViewsStore();
const { views } = storeToRefs(listViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss">
</style>
