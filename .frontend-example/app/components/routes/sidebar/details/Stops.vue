<template lang="pug">
.stops
    ol.list
        RoutesSidebarDetailsStop(v-for="routeStop in plannedStops" :key="routeStop.id" :route-stop="routeStop")
    .messages
        p(v-if="!routeRecord") {{ $t("routes.list.sidebar.details.No selected route") }}
        p(v-if="routeRecord && !plannedStops.length") {{ $t("routes.list.sidebar.details.No planned stops") }}
        p(v-if="unplannedStopsMessage") {{ unplannedStopsMessage }}
        p(v-if="totalRouteTimeText") {{ totalRouteTimeText }}
</template>
<script setup lang="ts">
const { t } = useI18n();
const routeDetailsStore = useRoutesListDetailsStore();
const { routeRecord } = storeToRefs(routeDetailsStore);

const plannedStops = computed(() => {
    return routeRecord.value?.routeStops?.filter(stop => stop.isPlanned) || [];
});

const unplannedStops = computed(() => {
    return routeRecord.value?.routeStops?.filter(stop => !stop.isPlanned) || [];
});

const unplannedStopsMessage = computed(() => {
    if (unplannedStops.value.length === 0) {
        return null;
    }
    return t("routes.list.sidebar.details.And X unplanned stops", { amount: unplannedStops.value.length });
});

const totalRouteTimeText = computed(() => {
    const totalTime = routeRecord.value?.getTotalTimeInMinutes();
    if (!totalTime) {
        return null;
    }
    const label = t("routes.list.sidebar.details.Total time");

    return `${label}: ${localizeDuration(totalTime)}`;
});

</script>
<style scoped lang="scss">
.stops {
    position: relative;

    .list {
        // not using @include flex-list because the items need easy overriding of padding
        position: relative;
        list-style: none;
        margin: 0;
        padding: 0;

        $item-padding: steps(1);
        $type-indicator-size: steps(2.5);

        // vertical line connecting type indicators
        &::before {
            content: "";
            position: absolute;

            left: calc(#{$item-padding} + (#{$type-indicator-size} / 2) - 1px);
            top: 0;
            bottom: 0;
            width: 0;
            border-right: 1px solid $color-border-highlight;
        }

        // overlap the line ends with solid blocks
        // so that lines don't stick out for the first and last item
        li:first-child::before,
        li:last-child::before {
            content: "";
            position: absolute;
            left: $item-padding;
            width: $type-indicator-size;
            background: $color-background-lighter; // this color must match the sidebar background
        }

        li:first-child::before {
            top: 0;
            bottom: 50%;

        }

        li:last-child::before {
            top: 50%;
            bottom: 0;
        }
    }

    .messages {
        display: flex;
        flex-direction: column;
        gap: steps(1);
    }
}
</style>
