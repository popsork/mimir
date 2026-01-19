<template lang="pug">
.invoicing-orders.page
    InvoicingHeader
    InvoicingOrdersHeaderViews
    NSplit(v-model:size="splitSize" :disabled="!sidebarOpen" class="split" :min="0.8" :max="0.85")
        template(v-slot:1)
            .table-wrapper(ref="tableWrapper")
                InvoicingOrdersTable(:available-height="availableHeight")
                InvoicingOrdersFloatingDock(:bounding-element="tableWrapper")
                InvoicingOrdersInvoicingDialog
        template(v-if="sidebarOpen" v-slot:2)
            .sidebar(:style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.InvoiceableOrderList")
</template>
<script setup lang="ts">
import {
    InvoicingOrdersSidebarFilters,
    InvoicingOrdersSidebarColumns,
    ViewsSettings
} from "#components";

definePageMeta({
    activeTopLevelRouteName: "invoicing"
});

const tableWrapper = useTemplateRef("tableWrapper");

const sidebarStore = useInvoicingOrdersSidebarStore();
const { sidebarSize, openedSidebar } = storeToRefs(sidebarStore);

const tableViewsStore = useInvoicingOrdersViewsStore();
const { selectedView, selectedViewId } = storeToRefs(tableViewsStore);

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
    routeName: "invoicing-orders",
    viewIdParam,
    context: ViewContext.InvoiceableOrderList,

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
            return InvoicingOrdersSidebarFilters;
        case ViewTool.ViewSettings:
            return ViewsSettings;
        case ViewTool.Columns:
            return InvoicingOrdersSidebarColumns;
    }
    return null;
});

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    if (selectedView.value && selectedView.value.name) {
        parts.push(selectedView.value.name);
    }

    parts.push(t("pages.titles.Invoiceable orders"));

    parts.push(t("pages.titles.Invoicing"));

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
        position: relative
    }
}
</style>
