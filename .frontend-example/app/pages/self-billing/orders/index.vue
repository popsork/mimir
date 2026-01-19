<template lang="pug">
.self-billing-orders.page
    SelfBillingHeader
    SelfBillingOrdersHeaderViews
    NSplit(v-model:size="splitSize" :disabled="!sidebarOpen" class="split" :min="0.8" :max="0.85")
        template(v-slot:1)
            .table-wrapper(ref="tableWrapper")
                SelfBillingOrdersTable(:available-height="availableHeight")
        template(v-if="sidebarOpen" v-slot:2)
            .sidebar(:style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.SelfBillableOrderList")
</template>
<script setup lang="ts">
import {
    SelfBillingOrdersSidebarFilters,
    SelfBillingOrdersSidebarColumns,
    ViewsSettings
} from "#components";

definePageMeta({
    activeTopLevelRouteName: "self-billing"
});


const tableWrapper = useTemplateRef("tableWrapper");

const sidebarStore = useSelfBillingSidebarStore();
const { sidebarSize, openedSidebar } = storeToRefs(sidebarStore);

const tableViewsStore = useSelfBillingOrdersViewsStore();
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
    routeName: "self-billing-orders",
    viewIdParam,
    context: ViewContext.SelfBillableOrderList,

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
            return SelfBillingOrdersSidebarFilters;
        case ViewTool.ViewSettings:
            return ViewsSettings;
        case ViewTool.Columns:
            return SelfBillingOrdersSidebarColumns;
    }
    return null;
});

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    if (selectedView.value && selectedView.value.name) {
        parts.push(selectedView.value.name);
    }

    parts.push(t("pages.titles.Self billing orders"));

    parts.push(t("pages.titles.Self billing"));

    return parts;
});

usePageTitle({ parts: titleParts });

</script>
<style scoped lang="scss">

</style>
