<template lang="pug">
OrdersSidebar(:title="$t('orders.list.sidebar.headings.Table filters')" v-on:close="closeSidebar")
    FilterBuilder(v-model="filters" :properties="filterableProperties")
</template>
<script setup lang="ts">
const viewsStore = useOrderTemplatesViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const columnsStore = useOrderTemplatesColumnsStore();
const { filterableProperties } = storeToRefs(columnsStore);

const sidebarStore = useOrderTemplatesSidebarStore();
const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const filters = computed(() => selectedView.value?.config.filters);

</script>
<style scoped lang="scss"></style>
