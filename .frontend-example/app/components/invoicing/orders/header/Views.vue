<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="invoicing-orders")
</template>
<script setup lang="ts">

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const invoicingOrdersViewsStore = useInvoicingOrdersViewsStore();
const { views } = storeToRefs(invoicingOrdersViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss"></style>
