<template lang="pug">
.self-billing-orders(v-if="selectedView")
    NDataTable(
        ref="table"
        v-model:checked-row-keys="internalSelectedRowIds"
        v-model:expanded-row-keys="expandedRowKeys"
        class="data-table"
        size="small"
        striped
        remote
        :bordered="false"
        :columns="tableColumns"
        :data="rows"
        table-layout="fixed"
        virtual-scroll
        virtual-scroll-x
        virtual-scroll-header
        :min-row-height="heightForRow()"
        :header-height="TABLE_HEADER_HEIGHT"
        :height-for-row="heightForRow"
        :row-key="getRowKey"
        :on-unstable-column-resize="handleUpdateColumnSize"
        :row-props="getRowProps"
        :min-height="tableHeight"
        :max-height="tableHeight"
        :loading="isLoading"
        v-on:update:sorter="handleSorterUpdate"
    )
    OrdersContextMenu(
        :table-views-store="tableViewsStore"
        :table-store="tableStore"
        row-order-id-attribute="order_id"
        :edit-order-default-tab-name="OrderFormTabName.DebitRows"
    )
</template>
<script setup lang="ts">
import type { DataTableColumn } from "naive-ui";

const TABLE_HEADER_HEIGHT = 28;
const SELECTION_COLUMN_WIDTH = 40;

const props = defineProps<{
    availableHeight: number,
}>();

const table = useTemplateRef<HTMLElement>("table");

const { width: tableWidth } = useElementBounding(table);
const availableColumnWidth = computed(() => tableWidth.value - SELECTION_COLUMN_WIDTH);

const tableHeight = computed(() => props.availableHeight - TABLE_HEADER_HEIGHT);

const rowsStore = useSelfBillingOrdersRowsStore();
const { someRowsLoaded } = storeToRefs(rowsStore);
rowsStore.loadRowsIfNeeded();

const tableStore = useSelfBillingOrdersTableStore();
const { rows, columns, internalSelectedRowIds, expandedRowKeys } = storeToRefs(tableStore);

const totalNumberOfRows = computed<number | undefined>(() => rows.value.length);

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const tableViewsStore = useSelfBillingOrdersViewsStore();
const { columnResizingKey, selectedView } = storeToRefs(tableViewsStore);

const columnsStore = useSelfBillingOrdersColumnsStore();
columnsStore.loadColumnsIfNeeded();
const { columnsLoaded } = storeToRefs(columnsStore);

const isLoading = computed(() => !someRowsLoaded.value || !columnsLoaded.value);

const { t } = useI18n();
const tableColumns = computed(() => {
    const cols = columns.value.map(col => ({
        key: col.key,
        title: t("self_billing.orders.columns." + col.key),
        width: col.width * availableColumnWidth.value,
        sorter: col.sortable,
        sortOrder: col.sorted ? col.sortOrder : false,
        resizable: true,
        ellipsis: {
            tooltip: {
                contentClass: "self-billing-orders-row-ellipsis",
            }
        },
        ellipsisComponent: "performant-ellipsis",
        render: getTableColumnRenderFunction(col, SELF_BILLING_ORDER_ROW_DEFINITION),
    })) as DataTableColumn[];

    cols.unshift({
        key: "_sel",
        type: "selection",
        width: SELECTION_COLUMN_WIDTH,
        tree: true
    } as DataTableColumn);

    return cols;
});


const {
    handleUpdateColumnSize,
    handleSorterUpdate,
    resizeColumnToWrapContent
} = useTableColumnHandling({
    tableColumns,
    availableColumnWidth,
    columnResizingKey,
    tableViewsStore,
    rows
});

useEventListener(table, "dblclick", resizeColumnToWrapContent);

const {
    heightForRow,
    getRowKey,
    getRowProps: getCommonRowProps,
    clearSelectRowTimeout
} = useTableRowHandling({
    totalNumberOfRows,
    internalSelectedRowIds,
    tableColumns
});

const getRowProps = (row: SelfBillingOrderTableRow) => {
    const commonProps = getCommonRowProps(row);

    const openEditOrderForm = (e: MouseEvent) => {
        clearSelectRowTimeout(e);

        if (!row.order_id) {
            return;
        }

        goToOrderRoute({ id: row.order_id, tab: OrderFormTabName.DebitRows });
    };

    return {
        ...commonProps,
        onDblclick: openEditOrderForm,
    };
};
</script>
<style scoped lang="scss">
.self-billing-orders {
    @include content-padding;
    padding-right: 0;
    height: 100%;
}

.data-table {
    :deep(.n-data-table-sorter) {
        margin-right: 3px;
    }

    // stylelint-disable selector-class-pattern
    :deep(.n-data-table-td--selection),
    :deep(.n-data-table-th--selection) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :deep(.action-menu-cell) {
        padding: 0;

        button {
            height: 26px;
        }
    }

    :deep(.n-data-table-tr.selected) {
        .n-data-table-td {
            background-color: $color-background-darkest;
        }
    }
}
</style>
<style lang="scss">
.self-billing-orders-row-ellipsis {
    max-width: min(steps(75), 80vw);
}
</style>
