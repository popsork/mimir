<template lang="pug">
.list(v-if="selectedView")
    NDataTable(
        ref="table"
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
        :loading="waitingForTemplates"
        :on-unstable-column-resize="handleUpdateColumnSize"
        v-on:update:sorter="handleSorterUpdate"
    )
</template>
<script setup lang="ts">
import type { DataTableColumn } from "naive-ui";

const TABLE_HEADER_HEIGHT = 28;

const props = defineProps<{
    availableHeight: number,
}>();

const table = useTemplateRef<HTMLElement>("table");

const { width: tableWidth } = useElementBounding(table);
const availableColumnWidth = computed(() => tableWidth.value);

const tableHeight = computed(() => props.availableHeight - TABLE_HEADER_HEIGHT);

const tableStore = useOrderTemplatesTableStore();
const { rows, columns, internalSelectedRowIds } = storeToRefs(tableStore);

const templatesStore = useOrderTemplatesListStore();
templatesStore.loadTemplates();

const { waitingForTemplates } = storeToRefs(templatesStore);

const tableViewsStore = useOrderTemplatesViewsStore();

const { columnResizingKey, selectedView } = storeToRefs(tableViewsStore);

const totalNumberOfRows = computed(() => rows.value.length);

const { t } = useI18n();


const openTemplate = (templateId: string) => {
    goToOrderRoute({ id: templateId, tab: OrderFormTabName.Schedule });
};

const tableColumns = computed(() => {
    const cols = columns.value.map(col => ({
        key: col.key,
        title: t("order_templates.list.columns." + col.key),
        width: col.width * availableColumnWidth.value,
        sorter: col.sortable,
        sortOrder: col.sorted ? col.sortOrder : false,
        resizable: true,
        ellipsis: {
            tooltip: {
                contentClass: "order-templates-list-row-ellipsis",
            }
        },
        ellipsisComponent: "performant-ellipsis",
        render: getTableColumnRenderFunction(col, ORDER_TEMPLATE_ROW_DEFINITION),
    })) as DataTableColumn[];

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

useEventListener(table, "dblclick", resizeColumnToWrapContent);

const getRowProps = (row: OrderTemplateTableRow) => {
    const commonProps = getCommonRowProps(row);

    return {
        ...commonProps,
        onDblclick: (e: MouseEvent) => {
            clearSelectRowTimeout(e);
            openTemplate(row.id);
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
</style>
<style lang="scss">
.order-templates-list-row-ellipsis {
    max-width: min(steps(75), 80vw);
}
</style>
