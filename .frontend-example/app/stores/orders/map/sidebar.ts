export const useOrdersMapSidebarStore = (() => {

    return defineSidebarStore({
        name: "orders-map-sidebar",
        defaultOpenedSidebar: ViewTool.Filters,
    });

})();
