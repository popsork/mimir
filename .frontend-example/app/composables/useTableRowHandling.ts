import type { DataTableBaseColumn, DataTableColumn } from "naive-ui";
import type { RowKey } from "naive-ui/lib/data-table/src/interface";

export const useTableRowHandling = (
    {
        totalNumberOfRows,
        internalSelectedRowIds,
        tableColumns

    }: {
        totalNumberOfRows: ComputedRef<number | undefined>,
        internalSelectedRowIds: Ref<RowKey[]>,
        tableColumns: ComputedRef<DataTableColumn[]>,
    }
) => {
    const heightForRow = () => 20;
    const getRowKey = (row: { id: string }) => row.id;

    const pressedKeys = useMagicKeys();
    const contextMenuStore = useOrdersContextMenuStore();

    //
    // By default, only one row should be able to be selected at a time but if the
    // user presses their respective "special" key for multiselect (meta/ctrl), then multiple
    // rows should be able to be selected. This watcher ensures that if the
    // multiselect-key is not pressed, then only the last selected row is kept.
    //
    // If the user clicks the "select all"-checkbox (i.e number of selected keys is equal
    // to the current row count) in the header, that should be allowed.
    //
    // As this functionality is not built-in in the Naive DataTable this is built
    // by watching the internalSelectedRowIds and applying the logic there.
    watch(internalSelectedRowIds, (selectedKeys) => {
        if (selectedKeys.length === totalNumberOfRows.value) {
            return;
        }

        const multiSelectKeyIsPressed = pressedKeys.ctrl!.value || pressedKeys.meta!.value;
        if (selectedKeys.length > 1 && !multiSelectKeyIsPressed) {
            internalSelectedRowIds.value = [selectedKeys[selectedKeys.length - 1]!];
        }
    }, { deep: true, immediate: true });


    let updateSelectedIdsTimeout = null as ReturnType<typeof setTimeout> | null;

    const clearSelectRowTimeout = (_e: MouseEvent) => {
        if (updateSelectedIdsTimeout) {
            clearTimeout(updateSelectedIdsTimeout);
            updateSelectedIdsTimeout = null;
        }
    };

    const getRowProps = (row: TableRow) => {
        const rowIsSelected = internalSelectedRowIds.value.includes(row.id);
        const rowClass = rowIsSelected ? "selected" : "";

        let mouseDownX = 0;
        let mouseDownY = 0;


        const openRowContextMenu = (e: MouseEvent) => {
            if (!e.target) {
                return;
            }

            const tdElem = (e.target as HTMLElement).closest(".n-data-table-td");
            if (!tdElem) {
                return;
            }

            const columnKey = tdElem.getAttribute("data-col-key");
            if (!columnKey) {
                return;
            }

            const column = tableColumns.value.find(col => (col as DataTableBaseColumn)?.key === columnKey) as DataTableColumn;
            if (!column) {
                return;
            }

            contextMenuStore.close();
            e.preventDefault();

            nextTick().then(() => {
                contextMenuStore.open({
                    position: { x: e.clientX, y: e.clientY },
                    context: {
                        row,
                        column,
                    }
                });
            });
        };

        //
        // These three functions (clearSelectRowTimeout (above), registerMouseStartPosition, addRowToSelectedRowIds)
        // handle what should happen when the user clicks on a row. When the user clicks on a row it is supposed
        // to be selected. But, if the user drags (selects text) or double-clicks the user intention was probably
        // not to select the row but something else. These functions check whether the user has moved the mouse
        // more than a specific threshold between mousedown and mouseup or if the user double-clicked. If so, the
        // select row action is skipped.

        const registerMouseStartPosition = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest(".n-data-table-expand-trigger")) {
                return;
            }

            mouseDownX = e.clientX;
            mouseDownY = e.clientY;

            clearSelectRowTimeout(e);
        };

        const addRowToSelectedRowIds = (e: MouseEvent) => {
            // Prevent selecting the row when click with middle or right side button.
            if (e.button === 2 || e.button === 1) {
                return;
            }
            if (e.target && (e.target as HTMLElement).closest(".n-checkbox")) {
                return;
            }

            const actionMenuIconClicked = !!(e.target as HTMLElement).closest(".trigger");
            //
            // How many pixels at most the mouse should be allowed to move for it to be considered a row-click.
            // This is for enabling drag-select text.
            const MOUSE_MOVE_THRESHOLD = 2;

            //
            // How many milliseconds we wait until the row is actually selected.
            // This is for allowing the user to double-click select text in the table.
            const UPDATE_SELECTED_KEYS_BACKOFF_MS = 100;
            //
            // If the mouse moved over a specific threshold between mouse down and mouse up
            // the user probably selected a text, and we will not select the row.
            const mouseMoveDiff = Math.abs(mouseDownX - e.clientX) + Math.abs(mouseDownY - e.clientY);
            if (mouseMoveDiff > MOUSE_MOVE_THRESHOLD) {
                return;
            }

            clearSelectRowTimeout(e);

            //
            // Start a timeout before actually selecting the row to see if the dblclick
            // event gets triggered (i.e. the user selects text using double click).
            updateSelectedIdsTimeout = setTimeout(() => {
            // if data are grouped, the row is a grouped row with having key as "grouped-by column"
            // we need to get the row.id as the id, i.e. we need to get it from the "children" member
                const rowId = row.children && row.children.length && row.children[0] ? row.children[0].id : row.id;
                if (internalSelectedRowIds.value.includes(rowId)) {
                    internalSelectedRowIds.value = internalSelectedRowIds.value.filter(key => key !== rowId);
                    if (actionMenuIconClicked) {
                        internalSelectedRowIds.value.push(rowId as RowKey);
                    }
                } else {
                    internalSelectedRowIds.value.push(rowId as RowKey);
                }

                updateSelectedIdsTimeout = null;
            }, UPDATE_SELECTED_KEYS_BACKOFF_MS);
        };

        return {
            onContextmenu: openRowContextMenu,
            onMousedown: registerMouseStartPosition,
            onMouseup: addRowToSelectedRowIds,
            class: rowClass,
        };
    };

    return {
        heightForRow,
        getRowKey,
        getRowProps,
        clearSelectRowTimeout
    };

};
