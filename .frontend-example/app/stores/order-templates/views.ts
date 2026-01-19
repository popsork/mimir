export const useOrderTemplatesViewsStore = (() => {

    return defineTableViewsStore({
        name: "order-templates-views",
        viewContext: ViewContext.OrderTemplates,
    });

})();
