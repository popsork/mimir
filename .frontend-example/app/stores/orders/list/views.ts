export const useOrdersListViewsStore = (() => {

    return defineTableViewsStore({
        name: "orders-list-views",
        viewContext: ViewContext.OrderList,
    });

})();
