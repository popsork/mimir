import type { SelfBillingOrderColumn } from "~/models/SelfBillingOrderColumn";

export type SelfBillingOrderTableRow = TableRow;

export const useSelfBillingOrdersTableStore = (() => {
    return defineTableStore<SelfBillingOrderRow, SelfBillingOrderColumn>({
        name: "self-billing-orders-table",
        getCollection: () => useSelfBillingOrdersRowsStore().collection,
        getSelectedView: () => useSelfBillingOrdersViewsStore().getSelectedView() as TableView | null,
        rowDefinition: SELF_BILLING_ORDER_ROW_DEFINITION,
        getColumnByKey: (...args) => useSelfBillingOrdersColumnsStore().getColumnByKey(...args),
    });
})();
