<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="self-billing-orders")
</template>
<script setup lang="ts">

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const selfBillingOrdersViewsStore = useSelfBillingOrdersViewsStore();
const { views } = storeToRefs(selfBillingOrdersViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss"></style>
