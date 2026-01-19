<template lang="pug">
.map(ref="mapContainer" :style="{ height: `${props.height}px` }")
</template>
<script setup lang="ts">
import type { RouteStop } from "~/models/RouteStop";

const props = defineProps<{
    height: number,
}>();

const routeMapStore = useRouteMapStore();
const {
    center,
    zoom,
    geoFeatures,
} = storeToRefs(routeMapStore);

const routeStopsStore = useRouteFormRouteStopsStore();
const { plannedRouteStopIds } = storeToRefs(routeStopsStore);

const mapContainer = useTemplateRef("mapContainer");

type RouteMapMarkerClickHandler = MapMarkerClickHandler<RouteMapPointFeature>;

const markerClickHandler: RouteMapMarkerClickHandler = ({ pointFeature }) => {
    const clickedStop = pointFeature.properties.meta.routeStop;

    switch (clickedStop.routeStopType) {
        case RouteStopType.Pickup:
            addPickupStopToPlanned(clickedStop);
            break;
        case RouteStopType.Delivery:
            addPickupAndDeliveryStopsToPlanned(clickedStop);
            break;
    }
};
const addPickupStopToPlanned = (routeStop: RouteStop) => {
    // if adding only pickup, the stop needs to go at the end of the planned list
    if (!plannedRouteStopIds.value.includes(routeStop.id)) {
        const newPlannedStopIds = [...plannedRouteStopIds.value, routeStop.id];
        plannedRouteStopIds.value = newPlannedStopIds;
    }
};

const addPickupAndDeliveryStopsToPlanned = (deliveryRouteStop: RouteStop) => {
    // when adding both pickup and delivery, pickup goes at the start of the planned list, delivery at the end
    // so that the first picked up order is the last one delivered
    // as loading/unloading of goods in the truck is first in, last out
    const newPlannedStopIds = [...plannedRouteStopIds.value];
    const pickupRouteStop = routeStopsStore.getPickupRouteStopByTransportOrderId(deliveryRouteStop.transportOrderId);
    if (pickupRouteStop && !newPlannedStopIds.includes(pickupRouteStop.id)) {
        newPlannedStopIds.unshift(pickupRouteStop.id);
    }
    if (!newPlannedStopIds.includes(deliveryRouteStop.id)) {
        newPlannedStopIds.push(deliveryRouteStop.id);
    }
    plannedRouteStopIds.value = newPlannedStopIds;
};

const minPointsInClusterRef = ref(2);

const {
    mapInstance,
    mapWithMarkers: routeMap,
} = useMapWithMarkers<RouteMapPointFeature, RouteMapLineFeature, RouteMapFeature>(
    {
        mapContainer,
        centerRef: center,
        zoomRef: zoom,
        markerClickHandler,
        minPointsInClusterRef,
    }
);

const waitStore = useWaitStore();

const updateRouteMap = async ({ calculateDrivingTimes }: { calculateDrivingTimes: boolean }) => {
    if (!routeMap.value) {
        return;
    }

    try {
        // the updateMap function itself is not async, but useThrottleFn always returns a Promise
        await routeMap.value.updateMap(geoFeatures.value);
    } catch (error) {
        if (error === undefined) {
            // if the call got rejected by throttling, it throws without an error object
            // in that case we need to return to not trigger driving time calculation
            return;
        }
        // rethtrow any other errors
        throw error;
    }

    if (calculateDrivingTimes) {
        try {
            waitStore.start(WaitingFor.RouteDrivingTimeCalculation);
            const drivingTimes = await routeMap.value.calculateDrivingTimes();

            const drivingTimesInMinutesByRouteStopId = Object.values(drivingTimes).reduce((result, drivingTime) => {
                const destinationRouteStopId = drivingTime.lineFeature.properties.meta.destinationRouteStop.id;
                result[destinationRouteStopId] = Math.ceil(drivingTime.drivingTimeInSeconds / 60);
                return result;
            }, {} as Record<string, number>);

            routeStopsStore.updateDrivingTimes(drivingTimesInMinutesByRouteStopId);
        } finally {
            waitStore.end(WaitingFor.RouteDrivingTimeCalculation);
        }
    }
};

watch([geoFeatures, routeMap, mapInstance], async (newValues, oldValues) => {
    // driving times should only be calculated when the points / lines change on the map.
    // so we can compare old and new geoFeatures to see if anything changed.
    // this watcher does not get triggered when geoFeatures initially get their first value,
    // so we don't need to handle that case here.
    const geoFeaturesChanged = JSON.stringify(oldValues[0]) !== JSON.stringify(newValues[0]);

    updateRouteMap({ calculateDrivingTimes: geoFeaturesChanged });
});

</script>
<style scoped lang="scss"></style>
