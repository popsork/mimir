<template lang="pug">
NDataTable(
    :columns="tableColumns"
    size="small"
    striped
    :data="props.data || []"
    :loading="props.loading"
    :bordered="false"
    :row-key="getRowKey"
    remote
    virtual-scroll
    table-layout="fixed"
    :min-row-height="heightForRow()"
    :header-height="TABLE_HEADER_HEIGHT"
    :height-for-row="heightForRow"
    :max-height="availableHeight"
    :row-props="getRowProps"
    v-on:update:sorter="handleSorterUpdate"
)
</template>
<script setup lang="ts">
import type { DataTableBaseColumn, DataTableColumn, DataTableSortState } from "naive-ui";
import type { CollectionDocument } from "sylviejs/database/collection/collection-document";
import DOMPurify from "dompurify";
import type { SearchSort } from "~/stores/search/defineSearchStore";

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });
const { heights } = storeToRefs(useDimensionsStore());

const TABLE_HEADER_HEIGHT = 28;
const heightForRow = () => 20;

const emit = defineEmits<{
    (e: "updateSort", sort: SearchSort | null): void,
    (e: "onRowDblclick", row: CollectionDocument): void,
}>();

const props = defineProps<{
    columns: DataTableColumn[],
    data: CollectionDocument[],
    loading: boolean,
}>();

const tableColumns = computed(() => props.columns.map(col => ({
    ...col,
    render(rowData: any, _rowIndex: any) {
        // this is needed for typescript type resolving to work.
        // col is a DataTableColumn which may not contain "key", but
        // we "know" this is a DataTableBaseColumn (atleast that it has a key)
        const columnAsBaseColumn = (col as DataTableBaseColumn);
        if (columnAsBaseColumn.render) {
            //
            // we need to sanitize the content before sending to the render function
            // as those renderers doesn't expect html
            const sanitizedContent = DOMPurify.sanitize((rowData[columnAsBaseColumn.key] || "") as string);
            return columnAsBaseColumn.render({
                ...rowData,
                [columnAsBaseColumn.key]: sanitizedContent,
            }, _rowIndex);
        }

        const content = (rowData[columnAsBaseColumn.key] || "") as string;
        const sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: ["mark"] });

        return h("span", {
            innerHTML: sanitizedContent
        });
    },
})));

const getRowKey = (row: { id: string }) => row.id;

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

const handleSorterUpdate = (options: DataTableSortState | DataTableSortState[] | null) => {
    if (options === null) {
        return;
    }

    const sortState = (Array.isArray(options) ? options[0] : options) as DataTableSortState;
    if (sortState.order !== false) {
        emit("updateSort", {
            key: sortState.columnKey + "",
            direction: sortState.order as SortingDirection,
        });
    } else {
        emit("updateSort", null);
    }
};

const getRowProps = (row: CollectionDocument) => {
    const triggerRowDblclickEvent = () => {
        emit("onRowDblclick", row);
    };

    return {
        onDblclick: triggerRowDblclickEvent
    };
};
</script>
<style scoped lang="scss"></style>
