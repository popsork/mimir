<template lang="pug">
.order-templates-list.page
    OrdersHeader
    OrdersTemplatesHeaderViews
    NSplit(v-model:size="splitSize" :disabled="!sidebarOpen" class="split" :min="0.8" :max="0.85")
        template(v-slot:1)
            OrdersTemplatesTable(:available-height="availableHeight")
        template(v-if="sidebarOpen" v-slot:2)
            .sidebar(:style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.OrderTemplates")
</template>
<script setup lang="ts">
import { ViewsSettings, OrdersTemplatesSidebarColumns, OrdersTemplatesSidebarFilters } from "#components";

definePageMeta({
    activeTopLevelRouteName: "orders"
});

const sidebarStore = useOrderTemplatesSidebarStore();
const { sidebarSize, openedSidebar } = storeToRefs(sidebarStore);

const listViewsStore = useOrderTemplatesViewsStore();
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
    routeName: "order-templates-list",
    viewIdParam,
    context: ViewContext.OrderTemplates,

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
        case ViewTool.Filters:
            return OrdersTemplatesSidebarFilters;
        case ViewTool.Columns:
            return OrdersTemplatesSidebarColumns;
        case ViewTool.ViewSettings:
            return ViewsSettings;
    }
    return null;
});

const { t } = useI18n();

const titleParts = computed(() => {
    return t("pages.titles.Templates");
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
