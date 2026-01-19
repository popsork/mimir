<template lang="pug">
OrdersSidebar(:title="$t('orders.list.sidebar.headings.Table filters')" v-on:close="closeSidebar")
    FilterBuilder(v-model="filters" :properties="filterableProperties")
</template>
<script setup lang="ts">
const viewsStore = useOrdersListViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const columnsStore = useOrdersListColumnsStore();
const { filterableProperties } = storeToRefs(columnsStore);

const sidebarStore = useOrdersListSidebarStore();
const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const filters = computed(() => selectedView.value?.config.filters);

</script>
<style scoped lang="scss"></style>
