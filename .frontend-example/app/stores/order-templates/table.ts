
export type OrderTemplateTableRow = TableRow;

export const useOrderTemplatesTableStore = (() => {
    return defineTableStore<OrderTemplateRow, OrderTemplateColumn>({
        name: "order-templates-table",
        getCollection: () => useOrderTemplatesListStore().collection,
        getSelectedView: () => useOrderTemplatesViewsStore().getSelectedView() as TableView | null,
        rowDefinition: ORDER_TEMPLATE_ROW_DEFINITION,
        getColumnByKey: (...args) => useOrderTemplatesColumnsStore().getColumnByKey(...args),
    });

})();
