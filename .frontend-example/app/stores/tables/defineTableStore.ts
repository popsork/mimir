import type { RowKey } from "naive-ui/lib/data-table/src/interface";
import { getSylvieJSQuery } from "~/utils/helpers/filter/getSylvieJSQuery";
import type { CollectionDocumentBase } from "sylviejs/database/collection/collection-document-base";
import type { Collection } from "sylviejs/database/collection/collection";
import type { CollectionDocument } from "sylviejs/database/collection/collection-document";
import type { OrderListColumn } from "~/models/OrderListColumn";
import type { InvoicingOrderColumn } from "~/models/InvoicingOrderColumn";
import type { ColumnDefinitionBase, ColumnDefinitionDate } from "~/utils/helpers/table/buildTableColumnDefinition";
import type { SelfBillingOrderColumn } from "~/models/SelfBillingOrderColumn";

type RequiredRowProps = {
    id: string,
};

export type TableRow = Partial<CollectionDocument> & {
    key: string,
    id: string,
    order_id: string | null,
    children?: Partial<CollectionDocument>[],
};

type OrderRowCompareFunction = (a: OrderRow, b: OrderRow) => number;
type SortOptions = {
    type: "simple" | "function",
    comparator?: OrderRowCompareFunction,
    columnKey?: OrderRowKey,
    descending?: boolean,
};

type SupportedTableColumn = OrderListColumn | InvoicingOrderColumn | OrderTemplateColumn | SelfBillingOrderColumn;

export function defineTableStore<
    RowType extends RequiredRowProps,
    ColumnType extends SupportedTableColumn
>(
    {
        name,
        getCollection,
        getSelectedView,
        rowDefinition,
        getColumnByKey
    }:
    {
        name: string,
        getCollection: () => Collection<RowType & CollectionDocumentBase>,
        getSelectedView: () => TableView | null,
        rowDefinition: Record<string, FilterConditionDefinition>,
        getColumnByKey: (key: string) => ColumnType | null,
    }
) {

    return defineStore(name, () => {
        const groupBy = ref(null as string | null);

        // this is a workaround for naive-ui data table messing up selected rows.
        // if a checked row disappears from the table (e.g. due to filtering or the row being live-deleted etc),
        // naive-ui does not remove it from its internal selected rows array,
        // so we cannot rely on naive-ui's internal selected rows id list directly,
        // as selectedRowIds should always return only what is actually visible in the table.
        // instead, we allow naive-ui to manage internalSelectedRowIds
        // and expose our own read-only selectedRowIds which is filtered based on currently available rows.
        const internalSelectedRowIds = ref([] as RowKey[]);
        const availableRowIds = ref<Set<string>>(new Set());
        const selectedRowIds = computed(() => {
            const ids = internalSelectedRowIds.value;
            return ids.filter(id => availableRowIds.value.has(id as string));
        });

        const expandedRowKeys = ref([] as Array<string | number>);
        const defaultSortOptions = {
            type: "simple",
            columnKey: "id" as OrderRowKey,
            descending: true,
        } as SortOptions;

        const selectedView = computed(() => {
            return getSelectedView();
        });

        const findQuery = computed<Record<string, any>>(() => {
            if (!selectedView.value) {
                return {};
            }

            return getSylvieJSQuery(selectedView.value.config.filters, rowDefinition);
        });

        //
        // Currently, only one column can be sorted even though the data model
        // supports multiple sorted columns. So here we only take the first one
        // and sorts on that. The rest of the code will ensure only one column
        // is sorted at a time. If this needs to be changed it will be discussed in TMS-1007.
        // This function either returns a comparator function or a simple key to sort on,
        // it does not always create its own comparator function because SyvlieJS has some optimizations
        // done in its own sort (especially when using indexes).
        const sortOptions = computed<SortOptions>(() => {
            const firstSortedColumn = selectedView.value?.config.columns.find(c => c.isSorted);
            if (firstSortedColumn) {
                const columnKey = firstSortedColumn.key as keyof typeof rowDefinition;
                const definition = rowDefinition[columnKey];
                if (!definition) {
                    return defaultSortOptions;
                }

                if (definition.type === "date" && (definition as ColumnDefinitionDate).sortDateOn && (definition as ColumnDefinitionDate).sortTimeOn) {
                    return {
                        type: "function",
                        comparator: buildDateSortingCompareFunction(
                            (definition as ColumnDefinitionDate).sortDateOn as OrderRowKey,
                            (definition as ColumnDefinitionDate).sortTimeOn as OrderRowKey,
                            firstSortedColumn.sortDirection,
                        )
                    };
                }

                return {
                    type: "simple",
                    columnKey: ((definition as ColumnDefinitionBase).sortOn || columnKey) as OrderRowKey,
                    descending: firstSortedColumn.sortDirection === SortingDirection.Descending,
                };
            }

            return defaultSortOptions;
        });

        const buildDateSortingCompareFunction = (dateKey: OrderRowKey, timeKey: OrderRowKey, direction: SortingDirection | null): OrderRowCompareFunction => {
            const compareStringAscending = (a: string, b: string) => a.localeCompare(b);
            const compareStringDescending = (a: string, b: string) => b.localeCompare(a);
            const compareString = (direction === SortingDirection.Descending) ? compareStringDescending : compareStringAscending;

            //
            // First sort on the date-only field, if those are equal
            // sort the time descending so that `null` times (i.e. 00:00/23:59)
            // always comes last.
            return (a: OrderRow, b: OrderRow) => {
                const aDate = a[dateKey] as string | null;
                const bDate = b[dateKey] as string | null;

                if (aDate === bDate) {
                    const aTime = a[timeKey] as string | null;
                    const bTime = b[timeKey] as string | null;

                    if (aTime === bTime) {
                        return 0;
                    }

                    if (aTime === null) {
                        return 1;
                    }

                    if (bTime === null) {
                        return -1;
                    }

                    return compareString(aTime, bTime);
                }

                if (aDate === null) {
                    return 1;
                }

                if (bDate === null) {
                    return -1;
                }

                return compareString(aDate, bDate);
            };
        };

        const viewColumns = computed(() => {
            if (!selectedView.value) {
                return [];
            }

            return selectedView.value.config.columns;
        });

        const selectedViewColumnsTotalWidth = computed(() => {
            return viewColumns.value.reduce((sum, col) => sum + col.width, 0);
        });

        const getLastColumnWidthAdjustment = () => {
            if (selectedViewColumnsTotalWidth.value > 1) {
                return (1 - selectedViewColumnsTotalWidth.value);
            } else if (selectedViewColumnsTotalWidth.value < 1) {
                return -(selectedViewColumnsTotalWidth.value - 1);
            }

            return 0;
        };

        const getGroupedTableColumnsIfNeeded = (tableColumns: TableColumn[]) => {
            if (groupBy.value) {
                const index = tableColumns.findIndex(c => c.key === groupBy.value);
                if (index >= 0) {
                    const col = tableColumns.splice(index, 1)[0] as TableColumn;
                    tableColumns.unshift(col);
                }
            }

            return tableColumns;
        };

        const tableColumns = computed(() => {
            if (!selectedView.value) {
                return [];
            }

            const lastColumnWidthAdjustment = getLastColumnWidthAdjustment();
            const lastIndex = viewColumns.value.length - 1;

            const result = viewColumns.value.map((viewColumn, index) => {
                const column = getColumnByKey(viewColumn.key);
                if (!column) {
                    return null;
                }

                const columnWidth = (viewColumn.width + (lastIndex === index ? lastColumnWidthAdjustment : 0));
                const tableColumn: TableColumn = {
                    key: viewColumn.key,
                    width: columnWidth,
                    sortable: column.sortable,
                    sorted: viewColumn.isSorted,
                    sortOrder: viewColumn.sortDirection,
                };
                return tableColumn;
            }).filter(c => !!c);

            return getGroupedTableColumnsIfNeeded(result);
        });

        const getFilteredRows = () => {
            // using a function instead of a computed property here
            // to avoid any reactivity overhead when returning many rows
            if (!selectedView.value) {
                return [];
            }

            const collection = getCollection();

            console.time("getFilteredRows");
            const query = collection
                .chain()
                .find(findQuery.value)
                .limit(MAX_NUMBER_OF_TABLE_ROWS);

            if (sortOptions.value.type === "function") {
                query.sort(sortOptions.value.comparator);
            } else {
                query.simplesort(sortOptions.value.columnKey, sortOptions.value.descending);
            }

            const rows = query.data();
            console.timeEnd("getFilteredRows");
            return rows;
        };

        const tableRows = computed(() => {

            const rows = getFilteredRows();

            availableRowIds.value = new Set(rows.map((row: RowType) => row.id));

            if (groupBy.value) {
                const groupedRows = rows.reduce((result: Record<string, TableRow>, item: TableRow) => {
                    const key = item[groupBy.value as string] as string;
                    if (!result[key]) {
                        result[key] = {
                            [groupBy.value as string]: key,
                            id: key,
                            order_id: null,
                            key,
                            children: []
                        };
                    }

                    result[key].children!.push(item);
                    return result;
                }, {});
                return Object.values<TableRow[]>(groupedRows);
            }

            return rows;
        });

        const selectedRows = computed(() => {
            return getFilteredRows().filter((row: RowType) => selectedRowIds.value.includes(row.id));
        });

        const deselectAllRows = () => {
            internalSelectedRowIds.value = [];
        };

        watch(groupBy, () => {
            expandedRowKeys.value = [];
        });

        return {
            columns: tableColumns,
            rows: tableRows,
            rowDefinition,
            internalSelectedRowIds,
            selectedRowIds,
            selectedRows,
            deselectAllRows,
            groupBy,
            expandedRowKeys,
        };
    });

}
