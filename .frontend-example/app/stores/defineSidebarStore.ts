export function defineSidebarStore(
    {
        name,
        defaultOpenedSidebar
    }:
    {
        name: string,
        defaultOpenedSidebar: ViewTool | null,
    }
) {

    return defineStore(name, () => {
        const defaultSidebar = ref(defaultOpenedSidebar as ViewTool | null);
        const openedSidebar = ref(defaultOpenedSidebar as ViewTool | null);
        const sidebarSize = ref(0.8);

        const openSidebar = (tool: ViewTool | null) => {
            openedSidebar.value = tool;
        };

        const toggleSidebar = (tool: ViewTool) => {
            openedSidebar.value = (openedSidebar.value === tool) ? null : tool;
        };

        const closeSidebar = (tool?: ViewTool) => {
            if (!tool || openedSidebar.value === tool) {
                openedSidebar.value = null;
            }
        };

        const isSidebarOpen = (tool?: ViewTool) => {
            if (tool) {
                return openedSidebar.value === tool;
            }

            return openedSidebar.value !== null;
        };

        return {
            openedSidebar,
            openSidebar,
            toggleSidebar,
            closeSidebar,
            sidebarSize,
            isSidebarOpen,
            defaultSidebar,
        };
    });

}
