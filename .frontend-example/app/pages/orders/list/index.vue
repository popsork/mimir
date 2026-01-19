<template lang="pug">
.orders-list.page
    OrdersHeader
    OrdersListHeaderViews
    NSplit(v-model:size="splitSize" :disabled="!sidebarOpen" class="split" :min="0.8" :max="0.85")
        template(v-slot:1)
            .table-wrapper(ref="tableWrapper")
                OrdersTable(:available-height="availableHeight")
                OrdersListFloatingDock(:bounding-element="tableWrapper")
                OrdersDispatchDialog
                OrdersCompleteDialog
                OrdersAddToRouteDialog
        template(v-if="sidebarOpen" v-slot:2)
            .sidebar(:style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.OrderList")
</template>
<script setup lang="ts">
import {
    OrdersListSidebarColumns,
    OrdersListSidebarFilters,
    OrdersSidebarDetails,
    ViewsSettings
} from "#components";

definePageMeta({
    activeTopLevelRouteName: "orders"
});

const tableWrapper = useTemplateRef("tableWrapper");

const sidebarStore = useOrdersListSidebarStore();
const { sidebarSize, openedSidebar } = storeToRefs(sidebarStore);

const listViewsStore = useOrdersListViewsStore();
const { selectedView, selectedViewId } = storeToRefs(listViewsStore);

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

watch(viewIdParam, (id) => {
    if (id === null) {
        return;
    }

    selectedViewId.value = id;
}, { immediate: true });

useViewRouteParamCorrection({
    routeName: "orders-list",
    viewIdParam,
    context: ViewContext.OrderList,

    // typecast needed here because storeToRefs loses the type for some reason
    selectedView: selectedView as Ref<TableView>,
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
        case ViewTool.Columns:
            return OrdersListSidebarColumns;
        case ViewTool.Filters:
            return OrdersListSidebarFilters;
        case ViewTool.Details:
            return OrdersSidebarDetails;
        case ViewTool.ViewSettings:
            return ViewsSettings;
    }
    return null;
});

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    if (selectedView.value && selectedView.value.name) {
        parts.push(selectedView.value.name);
    }

    parts.push(t("pages.titles.List view"));

    return parts;
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
        position: relative;
        @include panel-shadow;
    }
}
</style>
