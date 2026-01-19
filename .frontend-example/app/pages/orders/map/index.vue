<template lang="pug">
.orders-map.page
    OrdersHeader
    OrdersMapHeaderViews
    WaitingBox(:while="!viewsLoaded")
        .map-section(:data-sidebar="sidebarOpen ? 'open' : 'closed'")
            .map-panel
                OrdersMapContainer(:height="availableHeight - 40")
            .sidebar(v-if="sidebarOpen" :data-type="openedSidebar" :style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.OrderMap")
</template>
<script setup lang="ts">
import {
    OrdersMapSidebarFilters,
    OrdersSidebarDetails,
    ViewsSettings,
} from "#components";

definePageMeta({
    activeTopLevelRouteName: "orders"
});
usePageTitle({ translation: "pages.titles.Map view" });

const route = useRoute();

const viewIdParam = computed(() => {
    return (typeof route.query.view === "string") ? route.query.view : null;
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader + heights.value.secondaryPageHeader + heights.value.viewsHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

// operations are needed for filters sidebar, so we can pre-emptively start loading them here already
// to reduce wait time when opening the filters sidebar
const mapStore = useOrdersMapStore();
mapStore.loadOperationsIfNeeded();

const rowsStore = useOrdersRowsStore();
rowsStore.loadRowsIfNeeded();

const sidebarStore = useOrdersMapSidebarStore();
const { openedSidebar, defaultSidebar } = storeToRefs(sidebarStore);
const sidebarOpen = computed(() => sidebarStore.isSidebarOpen());

const mapViewsStore = useOrdersMapViewsStore();
const { selectedView, selectedViewId } = storeToRefs(mapViewsStore);

const viewsStore = useViewsStore();
const { viewsLoaded } = storeToRefs(viewsStore);

watch(viewIdParam, (id) => {
    if (id === null) {
        return;
    }

    selectedViewId.value = id;
}, { immediate: true });

watch(selectedView, () => {
    if (!selectedView.value) {
        return;
    }

    const sideBar = selectedView.value.config.sidebar ?? defaultSidebar.value;
    sidebarStore.openSidebar(sideBar);

}, { immediate: true });

useViewRouteParamCorrection({
    routeName: "orders-map",
    viewIdParam,
    context: ViewContext.OrderMap,

    // typecast needed here because storeToRefs loses the type for some reason
    selectedView: selectedView as Ref<OrderMapView>,
});

const sidebarComponent = computed(() => {
    switch (openedSidebar.value) {
        case ViewTool.Filters: return OrdersMapSidebarFilters;
        case ViewTool.Details: return OrdersSidebarDetails;
        case ViewTool.ViewSettings: return ViewsSettings;
    }
    return null;
});

</script>
<style scoped lang="scss">
.map-section {
    position: relative;
    display: flex;
    width: 100%;

    .map-panel {
        position: relative;
        padding: $gutter;
        flex: 1 1 80%;

        .map {
            border-radius: $element-border-radius;
        }
    }

    .sidebar {
        position: relative;
        flex: 0 0 steps(40);
        @include panel-shadow;
    }

    &[data-sidebar="open"] {
        .map {
            flex: 1 1 auto;
        }
    }

    &[data-sidebar="closed"] {
        .map {
            flex: 0 0 100%;
        }
    }
}
</style>
