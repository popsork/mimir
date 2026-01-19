export const useSelfBillingOrdersViewsStore = (() => {

    return defineTableViewsStore({
        name: "self-billing-orders-views",
        viewContext: ViewContext.SelfBillableOrderList,
    });

})();



