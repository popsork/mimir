<template lang="pug">
.results(v-if="canShowResults")
    SearchResultsTable(:columns="tableColumns" :data="tableRows" :loading="loading" v-on:update-sort="handleUpdateSort" v-on:on-row-dblclick="handleRowDblclick" )
</template>
<script setup lang="ts">
import type { DataTableBaseColumn, DataTableColumn } from "naive-ui";
import type { CollectionDocument } from "sylviejs/database/collection/collection-document";

const { t } = useI18n();
const waitStore = useWaitStore();
const searchStore = useSearchStore();
const { selectedScope, query } = storeToRefs(searchStore);

const canShowResults = computed(() => query && !waitStore.is(WaitingFor.Search));

watch([selectedScope, canShowResults], ([scope, ready]) => {
    if (scope && ready) {
        searchStore.getStoreForScope(scope)?.loadResultsIfNeeded();
    }
});

const tableRows = computed(() => {
    const store = searchStore.getStoreForScope(selectedScope.value);
    if (!store) {
        return [];
    }

    return store.tableRows;
});

const loading = computed(() => {
    const store = searchStore.getStoreForScope(selectedScope.value);
    if (!store) {
        return true;
    }

    return store.isLoadingResults;
});

const getTranslationScope = (scope: SearchScope) => {
    switch (scope) {
        case SearchScope.Orders: return "orders.list.columns";
        case SearchScope.Customers:
        case SearchScope.Articles:
        case SearchScope.Specifications:
        case SearchScope.Deviations:
            return `search.table.${scope}`;
    }
};

const tableColumns = computed<DataTableColumn[]>(() => {
    const store = searchStore.getStoreForScope(selectedScope.value);
    const translationKey = getTranslationScope(selectedScope.value);
    if (!store) {
        return [];
    }

    return Object.entries(store.columns).map(([key, _definition]) => {
        return {
            key,
            resizable: true,
            ellipsis: {
                tooltip: true
            },
            sorter: true,
            sortOrder: (store.sort?.key === key ? store.sort?.direction : false),
            ellipsisComponent: "performant-ellipsis",
            title: t(`${translationKey}.${key}`),
            render: getTableColumnRenderFunction({ key }, { [key]: _definition }),
        } as DataTableBaseColumn;
    });
});

const handleUpdateSort = (options: any) => {
    const store = searchStore.getStoreForScope(selectedScope.value);
    if (!store) {
        return;
    }

    store.sort = options;
};

const stripTags = (str: string) => str.replace(/<(.*?)>/g, "");
const handleOrderDblClick = (row: CollectionDocument) => {
    if (!row.order_id) {
        return;
    }

    goToOrderRoute({ id: stripTags(row.order_id) });
};

const handleSpecificationDblClick = (row: CollectionDocument) => {
    if (!row.order_id) {
        return;
    }

    goToOrderRoute({ id: stripTags(row.order_id), tab: OrderFormTabName.Specification });
};

const handleDeviationDblClick = (row: CollectionDocument) => {
    if (!row.order_id) {
        return;
    }

    goToOrderRoute({ id: stripTags(row.order_id), tab: OrderFormTabName.Deviations });
};

const handleRowDblclick = (row: CollectionDocument) => {
    if (selectedScope.value === SearchScope.Orders) {
        handleOrderDblClick(row);
        return;
    }

    if (selectedScope.value === SearchScope.Specifications) {
        handleSpecificationDblClick(row);
    }

    if (selectedScope.value === SearchScope.Deviations) {
        handleDeviationDblClick(row);
    }
};

</script>
<style scoped lang="scss"></style>
