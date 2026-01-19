<template lang="pug">
OrdersSidebar(v-if="selectedView" :title="$t('orders.map.filters.Filters')" v-on:close="closeSidebar")
    .controls
        .view-plan-placeholder
            // placeholder for view/plan buttons. Implemented in: TMS-1329
        OrdersMapSidebarFilterLinesSwitch
    OrdersMapSidebarFilterOperations
    OrdersMapSidebarFilterDate
    OrdersMapSidebarFilterStatus
    OrdersMapSidebarFilterStopType
    OrdersMapSidebarFilterStopLimits
    OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Filters')")
        FilterBuilder(v-model="filters" :properties="filterableProperties")
</template>
<script setup lang="ts">
const sidebarStore = useOrdersMapSidebarStore();
const columnsStore = useOrdersListColumnsStore();
columnsStore.loadColumnsIfNeeded();
const { filterableProperties } = storeToRefs(columnsStore);

const ordersMapStore = useOrdersMapStore();
const { filters } = storeToRefs(ordersMapStore);

const viewsStore = useOrdersMapViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const closeSidebar = () => {
    sidebarStore.closeSidebar();
};
</script>
<style scoped lang="scss">
.controls {
    display: flex;
    justify-content: space-between;
}
</style>
