<template lang="pug">
.list(v-if="selectedView")
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
        :selected-row-ids="selectedRowIds"
        row-order-id-attribute="order_id"
        :edit-order-default-tab-name="OrderFormTabName.Transport"
    )
</template>
<script setup lang="ts">
import type { DataTableColumn } from "naive-ui";
import { OrdersListActionMenu } from "#components";

const TABLE_HEADER_HEIGHT = 28;
const SELECTION_COLUMN_WIDTH = 40;
const ACTION_MENU_COLUMN_WIDTH = 28;

const props = defineProps<{
    availableHeight: number,
}>();

const table = useTemplateRef<HTMLElement>("table");

const { width: tableWidth } = useElementBounding(table);
const availableColumnWidth = computed(() => tableWidth.value - SELECTION_COLUMN_WIDTH - ACTION_MENU_COLUMN_WIDTH);

const tableHeight = computed(() => props.availableHeight - TABLE_HEADER_HEIGHT);

const rowsStore = useOrdersRowsStore();
const { someRowsLoaded } = storeToRefs(rowsStore);

rowsStore.loadRowsIfNeeded();

const sidebarStore = useOrdersListSidebarStore();

const tableStore = useOrdersListTableStore();
const { rows, columns, selectedRowIds, internalSelectedRowIds, expandedRowKeys } = storeToRefs(tableStore);
const totalNumberOfRows = computed<number | undefined>(() => rows.value.length);

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const tableViewsStore = useOrdersListViewsStore();

const { columnResizingKey, selectedView } = storeToRefs(tableViewsStore);

const columnsStore = useOrdersListColumnsStore();
columnsStore.loadColumnsIfNeeded();
const { columnsLoaded } = storeToRefs(columnsStore);

const isLoading = computed(() => !someRowsLoaded.value || !columnsLoaded.value);

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { selectedOrderRowId: detailsSidebarRowId } = storeToRefs(detailsSidebarStore);

const { t } = useI18n();

const openOrder = () => {
    if (selectedRowIds.value.length === 0) {
        return;
    }

    const id = selectedRowIds.value[0];
    const row = rowsStore.getRowById(id as string);
    if (!row) {
        return;
    }

    const orderId = row.order_id;
    if (!orderId) {
        throw new Error(`Order ID is missing in order list for row ID ${row.id}`);
    }

    goToOrderRoute({ id: orderId });
};


const previewOrder = () => {
    if (selectedRowIds.value.length === 0) {
        return;
    }

    const id = selectedRowIds.value[selectedRowIds.value.length - 1];
    if (!id) {
        return;
    }

    detailsSidebarRowId.value = id as string;
    sidebarStore.toggleSidebar(ViewTool.Details);
};

useKeyboardShortcuts({
    [OrderListShortcut.PreviewOrder]: previewOrder,
    [OrderListShortcut.OpenOrder]: openOrder,
});

watch(selectedRowIds, (selectedKeys) => {
    if (selectedKeys.length === 0) {
        detailsSidebarRowId.value = null;
        sidebarStore.closeSidebar(ViewTool.Details);
        return;
    }

    const row = rowsStore.getRowById(selectedKeys[selectedKeys.length - 1]! as string);
    if (row) {
        detailsSidebarRowId.value = row.id;
    }

}, { deep: true, immediate: true });


const tableColumns = computed(() => {
    const cols = columns.value.map(col => ({
        key: col.key,
        title: t("orders.list.columns." + col.key),
        width: col.width * availableColumnWidth.value,
        sorter: col.sortable,
        sortOrder: col.sorted ? col.sortOrder : false,
        resizable: true,
        ellipsis: {
            tooltip: {
                contentClass: "order-list-row-ellipsis",
            }
        },
        ellipsisComponent: "performant-ellipsis",
        render: getTableColumnRenderFunction(col, ORDER_ROW_DEFINITION),
    })) as DataTableColumn[];

    cols.unshift({
        key: "_sel",
        type: "selection",
        width: SELECTION_COLUMN_WIDTH,
        tree: true
    } as DataTableColumn);

    cols.push({
        title: "",
        key: "_actions",
        width: ACTION_MENU_COLUMN_WIDTH,
        render: (cell: any) => {
            const isHeaderRow = cell.children && cell.children instanceof Array;
            return isHeaderRow ? null : h(OrdersListActionMenu, { row: cell });
        },
        className: "action-menu-cell",
        tree: true,
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
    clearSelectRowTimeout,
} = useTableRowHandling({
    totalNumberOfRows,
    internalSelectedRowIds,
    tableColumns
});


const getRowProps = (row: OrderTableRow) => {
    const commonProps = getCommonRowProps(row);

    const openEditOrderForm = (e: MouseEvent) => {
        clearSelectRowTimeout(e);

        if (!row.order_id) {
            return;
        }

        goToOrderRoute({ id: row.order_id, tab: OrderFormTabName.Transport });
    };

    let backgroundColorClass = null as string | null;
    if (row.is_denied) {
        backgroundColorClass = "is-denied";
    }

    if (row.status === OrderStatus.Dispatched) {
        backgroundColorClass = "is-dispatched";
    }

    return {
        ...commonProps,
        onDblclick: openEditOrderForm,
        class: backgroundColorClass,
    };
};

</script>
<style scoped lang="scss">
.list {
    @include content-padding;
    padding-right: 0;
    height: 100%;
}

.data-table {
    :deep(.n-data-table-sorter) {
        margin-right: 3px;
    }

    :deep(.is-dispatched) {
        background-color: $color-background-order-status-dispatched;

        > .n-data-table-td {
            background-color: $color-background-order-status-dispatched;
        }
    }

    :deep(.is-denied) {
        background-color: $color-background-order-status-denied;
        > .n-data-table-td {
            background-color: $color-background-order-status-denied;
        }
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
.order-list-row-ellipsis {
    max-width: min(steps(75), 80vw);
}
</style>
