import type { View } from "~/models/View";
import type { FilterExpression } from "~/types/filter/FilterExpression";
import type { SortingDirection } from "~/enums/SortingDirection";
import type { GenericTableColumn } from "~/types/GenericTableColumn";

export type TableViewSort = {
    key: string,
    direction: SortingDirection,
};

enum ColumnResizingStrategy {
    Before = "before",
    After = "after",
}

export type TableViewColumn = {
    key: string,
    width: number,
    isSorted: boolean,
    sortDirection: SortingDirection | null,
};

export type TableViewConfig = {
    columns: TableViewColumn[],
    filters: FilterExpression,
};

export type TableView = View<TableViewConfig>;

export function defineTableViewsStore(
    {
        name,
        viewContext
    }:
    {
        name: string,
        viewContext: ViewContext,
    }
) {

    return defineStore(name, () => {
        const viewsStore = useViewsStore();

        const {
            selectedViewId,
            selectedView,
            selectedViewIsDirty,
            refreshSelectedView,
        } = useSelectedView<TableView>();

        const getSelectedView = () => {
            // function needed for cases where the ref cannot be used directly
            // e.g. in store defintion params where a callback is needed
            // because pinia is not yet initialized during the definition phase
            return selectedView.value;
        };

        const views = computed(() => {
            const views = viewsStore.getViewsByContext(viewContext);

            return views.map((view) => {
                if (view.id === selectedView.value?.id) {
                    return selectedView.value!;
                }

                return view;
            }) as TableView[];
        });

        const viewsLoaded = computed(() => viewsStore.viewsLoaded);
        const columnResizingKey = ref(null as string | null);
        const columnResizingStrategy = ref(null as ColumnResizingStrategy | null);

        const getDefaultView = () => {
            if (!viewsLoaded.value) {
                return null;
            }

            return views.value.find(v => v.type === ViewType.Default);
        };

        const getFilteredTemporaryView = (filterExpression: FilterExpression) => {
            const temporaryView = viewsStore.getOrCreateTemporaryView({
                context: viewContext,
                config: {
                    filters: filterExpression,
                },
            });

            if (!temporaryView) {
                return null;
            }

            temporaryView.isDirty = false;

            return temporaryView;
        };

        //
        // Update the widths of multiple columns at the same time.
        // Note! This method requires you to be sure that the total
        // width of all columns is exactly 1 (i.e. 100%).
        const updateViewColumnWidths = (columnWidths: Record<string, number>) => {
            if (!selectedView.value) {
                return false;
            }

            for (const column of selectedView.value.config.columns) {
                if (columnWidths[column.key]) {
                    column.width = columnWidths[column.key]!;
                }
            }

            return true;
        };

        const getColumnsWidth = (columns: TableViewColumn[]) => columns.reduce((sum, col) => sum + col.width, 0);

        const calculateColumnResizingStrategy = (keyIndex: number, visibleColumns: TableViewColumn[]) => {
            const availableWidthBefore = getColumnsWidth(visibleColumns.slice(0, keyIndex));
            const availableWidthAfter = getColumnsWidth(visibleColumns.slice(keyIndex + 1));

            return availableWidthBefore > availableWidthAfter ? ColumnResizingStrategy.Before : ColumnResizingStrategy.After;
        };

        //
        // Update the width of a column in the view, this method will ensure
        // that the total width of all columns is exactly 1 (i.e. 100%) by resizing
        // either the columns before or the columns after the user resized column.
        const updateViewColumnWidth = (key: string, requestedPercentage: number, columnOrder?: Record<string, number>) => {
            if (requestedPercentage < 0) {
                return false;
            }

            if (!selectedView.value) {
                return false;
            }

            // the explicit casting is needed here, otherwise TS doesn't get the types right for some reason
            const sortedVisibleColumns = [...selectedView.value.config.columns] as TableViewColumn[];
            if (columnOrder) {
                sortedVisibleColumns.sort((a, b) => columnOrder![a.key]! - columnOrder![b.key]!);
            }

            const keyIndex = sortedVisibleColumns.findIndex(vc => vc.key === key);

            if (columnResizingStrategy.value == null) {
                columnResizingStrategy.value = calculateColumnResizingStrategy(keyIndex, sortedVisibleColumns);
            }

            //
            // Calculate which other columns we are going to resize to fit the new column size
            // depending on the columnResizingStrategy.
            const start = columnResizingStrategy.value === ColumnResizingStrategy.Before ? 0 : keyIndex + 1;
            const end = columnResizingStrategy.value === ColumnResizingStrategy.Before ? keyIndex : sortedVisibleColumns.length;

            //
            // Calculate how much the other columns needs to be resized to fit the new column size
            const columnSizeDifference = requestedPercentage - sortedVisibleColumns[keyIndex]!.width;
            const columnsLeft = (end - start);
            const otherColumnWidthAdjustment = columnSizeDifference / columnsLeft;

            const columnsToUpdate: Record<string, number> = {
                [key]: requestedPercentage
            };

            for (let i = start; i < end; i++) {
                const col = sortedVisibleColumns[i]!;
                columnsToUpdate[col.key] = col.width - otherColumnWidthAdjustment;
            }

            return updateViewColumnWidths(columnsToUpdate);
        };

        const recalculateSelectedViewColumnWidths = () => {
            if (!selectedView.value) {
                return;
            }

            //
            // When a column is removed or added, we need to ensure that it can fit inside the table.
            // We do that by either compressing or expanding all visible columns in the table equally.
            const columnsTotalWidth = getColumnsWidth(selectedView.value.config.columns as TableViewColumn[]); // explicit cast needed by typescript

            if (columnsTotalWidth !== 1) {
                const totalWidthDifference = 1 - columnsTotalWidth;
                const widthAdjustmentPerColumn = totalWidthDifference / selectedView.value.config.columns.length;

                for (const column of selectedView.value.config.columns) {
                    column.width = column.width + widthAdjustmentPerColumn;
                }
            }
        };

        const addViewColumn = (column: GenericTableColumn) => {
            if (!selectedView.value) {
                return;
            }

            //
            // A new column gets an initial width of the table width divided
            // by the number of columns (in percentage). The already existing
            // columns will shrink by the same percentage (distributed evenly
            // across the existing columns).
            //
            // Example:
            //   Existing table has 3 columns with ~0.33 width each.
            //   A new column is added and gets 0.25 in width (1 / 4).
            //   The other columns need to shrink by 25%, meaning they
            //   keep 75% of their current width (1 - 0.25 = 0.75).
            const newCount = selectedView.value.config.columns.length + 1;
            const newColumnWidth = 1 / newCount;
            const restScaleFactor = 1 - newColumnWidth;

            selectedView.value.config.columns = selectedView.value.config.columns.map(column => ({
                ...column,
                width: column.width * restScaleFactor
            }));

            selectedView.value.config.columns.push({
                key: column.key,
                width: newColumnWidth,
                isSorted: false,
                sortDirection: null,
            });

            //
            // Even though we calculate and set the new widths before adding
            // the new column, sometimes the math doesn't exactly equal 1
            // so we also need to recalculate widths.
            recalculateSelectedViewColumnWidths();
        };

        const removeViewColumn = (column: TableViewColumn) => {
            if (!selectedView.value) {
                return;
            }

            const index = selectedView.value.config.columns.findIndex(c => c.key === column.key);
            if (index !== -1) {
                selectedView.value.config.columns.splice(index, 1);
                recalculateSelectedViewColumnWidths();
            }
        };

        const updateViewFilters = (groups: FilterConditionGroup[]) => {
            if (!selectedView.value) {
                return false;
            }

            selectedView.value.config.filters.groups = groups;
            return true;
        };

        const updateViewSort = (sort: TableViewSort) => {
            if (!selectedView.value) {
                return false;
            }

            for (const column of selectedView.value.config.columns) {
                column.isSorted = sort.key === column.key;
                column.sortDirection = sort.key === column.key ? sort.direction : null;
            }

            return true;
        };

        const resetViewFilters = () => {
            if (!selectedView.value || !selectedViewId.value) {
                return;
            }

            const originalView = viewsStore.views.find(v => v.id === selectedViewId.value) as TableView;
            if (!originalView) {
                return;
            }

            updateViewFilters(originalView.config.filters?.groups || []);
        };

        watch(columnResizingKey, () => {
            if (!columnResizingKey.value) {
                columnResizingStrategy.value = null;
            }
        });

        return {
            views,
            refreshSelectedView,
            columnResizingKey,
            updateViewColumnWidth,
            updateViewColumnWidths,
            updateViewFilters,
            updateViewSort,
            addViewColumn,
            removeViewColumn,
            selectedViewId,
            selectedView,
            getSelectedView,
            getDefaultView,
            getFilteredTemporaryView,
            selectedViewIsDirty,
            resetViewFilters,
        };
    });
}
