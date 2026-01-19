<template lang="pug">
OrdersSidebar(v-if="selectedView" :title="$t('self_billing.orders.sidebar.headings.Edit columns')" v-on:close="closeSidebar")
    ViewsListColumns(
        v-model:selected-columns="selectedColumns"
        translation-scope="self_billing.orders.columns"
        :columns="columns"
        v-on:add-column="addColumn"
        v-on:remove-column="removeColumn")
</template>
<script setup lang="ts">
const columnsStore = useSelfBillingOrdersColumnsStore();
const { columns } = storeToRefs(columnsStore);

const viewsStore = useSelfBillingOrdersViewsStore();
const { selectedView } = storeToRefs(viewsStore);

const sidebarStore = useSelfBillingSidebarStore();
const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const selectedColumns = computed({
    get() {
        if (!selectedView.value) {
            return [];
        }

        //
        // The typecasting is needed to make TS understand the return value for some reason
        return selectedView.value.config.columns as TableViewColumn[];
    },

    set(newValue: TableViewColumn[]) {
        if (!selectedView.value) {
            return;
        }

        selectedView.value.config.columns = newValue;
    }
});

const addColumn = (column: GenericTableColumn) => {
    if (!selectedView.value) {
        return;
    }

    viewsStore.addViewColumn(column);
};

const removeColumn = (column: TableViewColumn) => {
    if (!selectedView.value) {
        return;
    }

    viewsStore.removeViewColumn(column);
};

</script>
<style scoped lang="scss">

</style>
