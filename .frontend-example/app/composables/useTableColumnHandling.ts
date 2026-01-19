import type { DataTableBaseColumn, DataTableColumn, DataTableSortState } from "naive-ui";
import type { ColumnKey } from "naive-ui/lib/data-table/src/interface";
import { motusNaiveUiTheme } from "~/naive-ui.config";

type TableViewsStore = ReturnType<ReturnType<typeof defineTableViewsStore>>;

export const useTableColumnHandling = (
    {
        tableColumns,
        availableColumnWidth,
        columnResizingKey,
        tableViewsStore,
        rows

    }: {
        tableColumns: ComputedRef<DataTableColumn[]>,
        availableColumnWidth: ComputedRef<number>,
        columnResizingKey: Ref<string | null>,
        tableViewsStore: TableViewsStore,
        rows: ComputedRef<TableRow[]>,
    }
) => {

    //
    // Because the Naive UI DataTable doesn't expose any events telling us that resizing
    // is going on and sometimes the user might end the resize over a header. We manually
    // keep track of columnResizingKey and adds a small delay to let the sort event go thrugh
    // before we reset the columnResizingKey value.
    useEventListener(document, "mouseup", () => {
        setTimeout(() => {
            columnResizingKey.value = null;
        }, 50);
    });

    // Generates a Record<string, number> with column key and its respective order in the table
    // this is later used by the resizing algorithm to correctly size columns. This is needed
    // due to the user may group the table which puts the grouped column first in the table
    // while the view keeps the original column order in itself.
    const tableColumnOrder = computed(() => {
        return tableColumns.value
            .map(c => (c as DataTableBaseColumn).key as string)
            .filter(key => !key.startsWith("_"))
            .reduce((result, key, index) => ({
                ...result,
                [key]: index
            }), {});
    });

    // the function definition here needs the unused _getCellActualWidth argument and the specific type for column
    // so that it is compatible with the on-unstable-column-resize handler type expected by the NDataTable component
    const handleUpdateColumnSize = (
        widthAfterResize: number,
        _limitWidth: number,
        column: DataTableColumn,
        _getCellActualWidth: (key: ColumnKey) => number | undefined
    ) => {
        const requestedPercentage = widthAfterResize / availableColumnWidth.value;
        const key = (column as DataTableBaseColumn).key as string;

        columnResizingKey.value = key;
        tableViewsStore.updateViewColumnWidth(key, requestedPercentage, tableColumnOrder.value);
    };

    const handleSorterUpdate = (options: DataTableSortState | DataTableSortState[] | null) => {
        if (options === null || columnResizingKey.value) {
            return;
        }

        const sortState = (Array.isArray(options) ? options[0] : options) as DataTableSortState;
        if (sortState.order !== false) {
            tableViewsStore.updateViewSort({
                key: sortState.columnKey + "",
                direction: sortState.order as SortingDirection,
            });
        } else {
            tableViewsStore.updateViewSort({
                key: "id",
                direction: SortingDirection.Descending
            });
        }
    };


    const resizeColumnToWrapContent = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains("n-data-table-resize-button")) {
            return;
        }

        const header = target.closest(".n-data-table-th") as HTMLElement | null;
        if (!header) {
            return;
        }

        const columnKey = header.dataset.colKey as string | null | undefined;
        if (!columnKey) {
            return;
        }

        const fontSizeSmall = motusNaiveUiTheme.DataTable?.fontSizeSmall ?? "10px"; // @small-text
        const tdPadding = 10; // motusNaiveUiTheme.DataTable.tdPaddingSmall

        const font = `normal ${fontSizeSmall} geist`;

        const calculatedMaxWidth = rows.value.reduce((maxWidth, row) => Math.max(maxWidth, tdPadding + getTextWidth(row[columnKey] + " ", font)), 0);

        const requestedPercentage = Math.min(calculatedMaxWidth / availableColumnWidth.value, 0.5);
        tableViewsStore.updateViewColumnWidth(columnKey, requestedPercentage);
    };

    return {
        tableColumnOrder,
        handleUpdateColumnSize,
        handleSorterUpdate,
        resizeColumnToWrapContent,
    };

};
