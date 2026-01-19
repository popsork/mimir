<template lang="pug">
OrdersSidebar(:title="$t('orders.sidebar.headings.Transport order details')" v-on:close="closeSidebar")
    OrdersSidebarOverview
    OrdersSidebarSpecificationSummary
    OrdersSidebarGoodsSummary

    template(v-slot:footer)
        OrdersSidebarActions
</template>
<script setup lang="ts">
const mapSidebarStore = useOrdersMapSidebarStore();
const listSidebarStore = useOrdersListSidebarStore();
const calendarSidebarStore = useOrdersCalendarSidebarStore();

const closeSidebar = () => {
    listSidebarStore.closeSidebar(ViewTool.Details);
    mapSidebarStore.closeSidebar(ViewTool.Details);
    calendarSidebarStore.closeSidebar(ViewTool.Details);
};
</script>
<style scoped lang="scss"></style>
