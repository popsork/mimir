import type { OrderListColumn } from "~/models/OrderListColumn";

export type OrderTableRow = TableRow;

export const useOrdersListTableStore = (() => {

    return defineTableStore<OrderRow, OrderListColumn>({
        name: "orders-list-table",
        getCollection: () => useOrdersRowsStore().collection,
        getSelectedView: () => useOrdersListViewsStore().getSelectedView() as TableView | null,
        rowDefinition: ORDER_ROW_DEFINITION,
        getColumnByKey: (...args) => useOrdersListColumnsStore().getColumnByKey(...args),
    });

})();
