<template lang="pug">
.route.page
    OrdersHeader
    WaitingBox(:while="WaitingFor.RouteFormRouteLoading")
        .content
            .map-panel
                RouteMapContainer(:height="availableHeight - 40")
            .sidebar(data-type="route" :style="{ height: availableHeight + 'px' }")
                RouteSidebar
</template>
<script setup lang="ts">
definePageMeta({
    activeTopLevelRouteName: "orders",
    activeSecondLevelRouteName: "routes-list"
});

const route = useRoute();

const store = useRouteFormStore();

const { routeRecord, routeIsNew, routeIsMissing } = storeToRefs(store);

const routeId = computed(() => {
    if (typeof route.params.id !== "string") {
        return null;
    }
    if (route.params.id === "new") {
        return null;
    }
    return route.params.id;
});

watch(routeId, (routeIdFromRoute) => {
    if (routeIdFromRoute) {
        store.loadRouteIfNeeded(routeIdFromRoute);
    }

}, { immediate: true });

watch(routeIsMissing, (routeIsMissing) => {
    if (routeIsMissing) {
        show404();
    }
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {

    return heights.value.pageHeader + heights.value.secondaryPageHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

const { t } = useI18n();

const titleParts = computed(() => {
    if (routeIsNew.value) {
        return t("pages.titles.New route");
    }

    return t("pages.titles.Route", { name: routeRecord.value.name });
});

usePageTitle({ parts: titleParts });

</script>
<style scoped lang="scss">
.content {
    position: relative;
    display: flex;
    width: 100%;
    overflow: hidden; // this is to cut off the sidebar's shadow at the top

    .map-panel {
        position: relative;
        padding: $gutter;
        flex: 1 1 80%;

        .map {
            flex: 1 1 auto;
            border-radius: $element-border-radius;
        }
    }

    .sidebar {
        position: relative;
        flex: 0 0 steps(60);
        @include panel-shadow;
    }

}
</style>
