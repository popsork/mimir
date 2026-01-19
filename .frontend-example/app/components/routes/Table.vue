<template lang="pug">
.list
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
        :row-props="getRowProps"
        :min-height="tableHeight"
        :max-height="tableHeight"
        :loading="waitingForRoutes"
    )
</template>
<script setup lang="ts">
import type { DataTableColumn } from "naive-ui";
import type { Route } from "~/models/Route";

const TABLE_HEADER_HEIGHT = 28;
const SELECTION_COLUMN_WIDTH = 40;
const props = defineProps<{
    availableHeight: number,
}>();

const table = useTemplateRef<HTMLElement>("table");

const { width: tableWidth } = useElementBounding(table);
const availableColumnWidth = computed(() => tableWidth.value - SELECTION_COLUMN_WIDTH);

const tableHeight = computed(() => props.availableHeight - TABLE_HEADER_HEIGHT);

const sidebarStore = useRoutesListSidebarStore();
const routesStore = useRoutesListRoutesStore();
routesStore.loadRoutes();
const { waitingForRoutes } = storeToRefs(routesStore);

const { internalSelectedRowIds, selectedRowIds, expandedRowKeys, routes } = storeToRefs(routesStore);
const rows = computed(() => {
    return routes.value.map((route: Route) => {
        return {
            key: route.id,
            ...route
        };
    });
});

const totalNumberOfRows = computed(() => rows.value.length);

const { t } = useI18n();

const selectedRouteId = computed(() => {
    if (selectedRowIds.value.length === 0) {
        return null;
    }

    const id = selectedRowIds.value[selectedRowIds.value.length - 1];
    return id as string;
});

const previewSelectedRoute = () => {
    if (!selectedRouteId.value) {
        return;
    }

    sidebarStore.openSidebar(ViewTool.Details);
};

const openSelectedRoute = () => {
    if (!selectedRouteId.value) {
        return;
    }

    openRoute(selectedRouteId.value);
};

const openRoute = (routeId: string) => {
    goToRoute({ name: "routes-id", params: { id: routeId } });
};


useKeyboardShortcuts({
    [RouteListShortcut.PreviewRoute]: previewSelectedRoute,
    [RouteListShortcut.OpenRoute]: openSelectedRoute,
});


const columnNames = Object.keys(ROUTE_ROW_DEFINITION);
const numberOfColumns = columnNames.length;

const columns = computed(() => {
    return columnNames.map((name) => {
        const column: TableColumn = {
            key: name,
            width: 1 / numberOfColumns,
            sortable: false,
            sorted: false,
            sortOrder: null
        };
        return column;
    });
});

const tableColumns = computed(() => {
    const cols = columns.value.map(col => ({
        key: col.key,
        title: t("routes.list.columns." + col.key),
        width: col.width * availableColumnWidth.value,
        sorter: col.sortable,
        sortOrder: col.sorted ? col.sortOrder : false,
        resizable: false,
        ellipsis: {
            tooltip: {
                contentClass: "routes-list-row-ellipsis",
            }
        },
        ellipsisComponent: "performant-ellipsis",
        render: getTableColumnRenderFunction(col, ROUTE_ROW_DEFINITION),
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

    return {
        ...commonProps,
        onDblclick: (e: MouseEvent) => {
            clearSelectRowTimeout(e);
            openRoute(row.id);
        },
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
.routes-list-row-ellipsis {
    max-width: min(steps(75), 80vw);
}
</style>
