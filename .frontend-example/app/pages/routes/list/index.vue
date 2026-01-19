<template lang="pug">
.routes-list.page
    OrdersHeader
    NSplit(v-model:size="splitSize" :disabled="!sidebarOpen" class="split" :min="0.8" :max="0.85")
        template(v-slot:1)
            .table-wrapper(ref="tableWrapper")
                RoutesTable(:available-height="availableHeight")
                RouteActionsDialog
        template(v-if="sidebarOpen" v-slot:2)
            .sidebar(:style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.RouteList")
</template>
<script setup lang="ts">

import {
    RoutesSidebarDetails,
    RoutesSidebarFilters
} from "#components";
definePageMeta({
    activeTopLevelRouteName: "orders"
});

const tableWrapper = useTemplateRef("tableWrapper");

const sidebarStore = useRoutesListSidebarStore();
const { sidebarSize, openedSidebar } = storeToRefs(sidebarStore);

const sidebarOpen = computed(() => sidebarStore.isSidebarOpen());
const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader + heights.value.secondaryPageHeader + heights.value.viewsHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);


const route = useRoute();
const viewIdParam = computed(() => {
    return (typeof route.query.view === "string") ? route.query.view : null;
});

sidebarStore.closeSidebar();

useViewRouteParamCorrection({
    routeName: "routes-list",
    viewIdParam,
    context: ViewContext.RouteList,
    selectedView: null,
});


const splitSize = computed({
    get() {
        return sidebarOpen.value ? sidebarSize.value : 1;
    },
    set(value) {
        sidebarSize.value = value;
    }
});

const sidebarComponent = computed(() => {
    switch (openedSidebar.value) {
        case ViewTool.Filters:
            return RoutesSidebarFilters;
        case ViewTool.Details:
            return RoutesSidebarDetails;
        default:
            return null;
    }
});

const { t } = useI18n();

const titleParts = computed(() => {
    return t("pages.titles.List view");
});

usePageTitle({ parts: titleParts });


</script>
<style scoped lang="scss">
.split {
    :deep(.n-split-pane-2) {
        overflow: visible;
        z-index: 9;
    }

    .sidebar {
        height: 100%;
        background-color: $color-background-lighter;
        display: flex;
        flex-direction: column;
        position: relative;
        @include panel-shadow;
    }
}
</style>
