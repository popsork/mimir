<template lang="pug">
    .tools
        GenericButton(
            v-for="tool in visibleTools"
            :key="tool.icon"
            :type="tool.selected ? 'primary' : 'ghost'"
            size="small"
            :icon="tool.icon"
            :title="tool.title"
            v-on:click="tool.onClick"
        )
</template>
<script setup lang="ts">
import { ViewTool } from "~/enums/ViewTool";
const { t } = useI18n();
const sidebarStore = useRoutesListSidebarStore();
const routeListStore = useRoutesListRoutesStore();

const visibleTools = computed(() => {
    return [
        {
            icon: "funnel",
            title: t("views.tools.Filter"),
            tool: ViewTool.Filters,
            selected: sidebarStore.openedSidebar === ViewTool.Filters,
            onClick() {
                sidebarStore.toggleSidebar(ViewTool.Filters);
            },
        },
        {
            icon: "dock",
            title: t("views.tools.Details"),
            tool: ViewTool.Details,
            selected: sidebarStore.openedSidebar === ViewTool.Details,
            disabled: !routeListStore.isSingleRouteSelected,
            onClick() {
                sidebarStore.toggleSidebar(ViewTool.Details);
            },
        },
    ];
});

</script>
<style scoped lang="scss">
.tools {
    display: flex;
    align-items: center;
    gap: steps(0.5);
}
</style>
