<template lang="pug">
OrdersSidebar(:title="$t('invoicing.orders.sidebar.headings.Table filters')" v-on:close="closeSidebar")
    FilterBuilder(v-model="filters" :properties="filterableProperties")
</template>
<script setup lang="ts">
const viewsStore = useInvoicingOrdersViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const columnsStore = useInvoicingOrdersColumnsStore();
const { filterableProperties } = storeToRefs(columnsStore);

const sidebarStore = useInvoicingOrdersSidebarStore();
const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const filters = computed(() => selectedView.value?.config.filters);

</script>
<style scoped lang="scss"></style>
