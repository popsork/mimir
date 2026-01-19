<template lang="pug">
.orders-calendar.page
    OrdersHeader
    OrdersCalendarHeaderViews
    WaitingBox(:while="!viewsLoaded")
        .view
            .calendar
                OrdersCalendarHeader
                OrdersCalendarView(ref="calendarView")
                OrdersDispatchDialog
            .sidebar(v-if="sidebarOpen" :style="{ height: availableHeight + 'px' }")
                component(:is="sidebarComponent" v-if="sidebarComponent" :context="ViewContext.OrderCalendar")
</template>
<script setup lang="ts">
import {
    ViewsSettings,
    OrdersSidebarDetails
} from "#components";

definePageMeta({
    activeTopLevelRouteName: "orders"
});

const calendarView = useTemplateRef("calendarView");

const newUnitHandler = (unitId: string) => {
    if (calendarView.value) {
        calendarView.value.handleNewlyAddedUnit(unitId);
    }
};

provide("newUnitHandler", newUnitHandler);

const calendarViewsStore = useOrdersCalendarViewsStore();
const { selectedView, selectedViewId } = storeToRefs(calendarViewsStore);

const viewsStore = useViewsStore();
const { viewsLoaded } = storeToRefs(viewsStore);

const sidebarStore = useOrdersCalendarSidebarStore();
const { openedSidebar } = storeToRefs(sidebarStore);
const sidebarOpen = computed(() => sidebarStore.isSidebarOpen());

const sidebarComponent = computed(() => {
    switch (openedSidebar.value) {
        case ViewTool.ViewSettings: return ViewsSettings;
        case ViewTool.Details: return OrdersSidebarDetails;
    }
    return null;
});

const route = useRoute();
const viewIdParam = computed(() => {
    return (typeof route.query.view === "string") ? route.query.view : null;
});

watch(viewIdParam, (id) => {
    if (id === null) {
        return;
    }

    selectedViewId.value = id;
}, { immediate: true });

useViewRouteParamCorrection({
    routeName: "orders-calendar",
    viewIdParam,
    context: ViewContext.OrderCalendar,

    // typecast needed here because storeToRefs loses the type for some reason
    selectedView: selectedView as Ref<CalendarView>,
});

usePageTitle({ translation: "pages.titles.Calendar view" });

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader + heights.value.secondaryPageHeader + heights.value.viewsHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

</script>
<style scoped lang="scss">
.orders-calendar.page {
    flex: 1;

    display: flex;
    flex-direction: column;

    .view {
        display: flex;

        .calendar {
            flex: 1 1 80%;
        }

        .sidebar {
            position: relative;
            flex: 0 0 steps(40);
            @include panel-shadow;

        }
    }
}
</style>
