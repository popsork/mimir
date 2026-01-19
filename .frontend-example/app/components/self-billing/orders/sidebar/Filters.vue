<template lang="pug">
OrdersSidebar(:title="$t('self_billing.orders.sidebar.headings.Table filters')" v-on:close="closeSidebar")
    FilterBuilder(v-model="filters" :properties="filterableProperties")
</template>
<script setup lang="ts">
const viewsStore = useSelfBillingOrdersViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const columnsStore = useSelfBillingOrdersColumnsStore();
const { filterableProperties } = storeToRefs(columnsStore);

const sidebarStore = useSelfBillingSidebarStore();
const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const filters = computed(() => selectedView.value?.config.filters);

</script>
<style scoped lang="scss"></style>
