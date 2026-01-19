export const useInvoicingOrdersViewsStore = (() => {

    return defineTableViewsStore({
        name: "invoicing-orders-views",
        viewContext: ViewContext.InvoiceableOrderList,
    });

})();



