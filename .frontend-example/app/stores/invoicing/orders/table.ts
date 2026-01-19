import type { InvoicingOrderColumn } from "~/models/InvoicingOrderColumn";

export type InvoicingOrderTableRow = TableRow;

export const useInvoicingOrdersTableStore = (() => {

    return defineTableStore<InvoicingOrderRow, InvoicingOrderColumn>({
        name: "invoicing-orders-table",
        getCollection: () => useInvoicingOrdersRowsStore().collection,
        getSelectedView: () => useInvoicingOrdersViewsStore().getSelectedView() as TableView | null,
        rowDefinition: INVOICING_ORDER_ROW_DEFINITION,
        getColumnByKey: (...args) => useInvoicingOrdersColumnsStore().getColumnByKey(...args),
    });

})();

