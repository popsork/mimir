<template lang="pug">
.map(ref="mapContainer" :style="{ height: `${props.height}px` }")
OrdersDispatchDialog
.overlay-message(v-if="overlayMessage" ) {{ overlayMessage }}
</template>
<script setup lang="ts">
const props = defineProps<{
    height: number,
}>();

const ordersMapStore = useOrdersMapStore();
const {
    center,
    zoom,
    geoFeatures,
    maxStopsInVisibleArea,
    minStopsInCluster,
} = storeToRefs(ordersMapStore);

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { selectedOrderRowId } = storeToRefs(detailsSidebarStore);

const ordersMapSidebarStore = useOrdersMapSidebarStore();

const mapContainer = useTemplateRef("mapContainer");

type OrdersMapMarkerClickHandler = MapMarkerClickHandler<OrdersMapPointFeature>;

const markerClickHandler: OrdersMapMarkerClickHandler = ({ pointFeature }) => {
    selectedOrderRowId.value = pointFeature.properties.meta.transportOrderId;
    ordersMapSidebarStore.openSidebar(ViewTool.Details);
};

const { t } = useI18n();

const overlayMessage = ref(null as string | null);

const pointsUpdatedHandler: MapPointsUpdatedHandler = ({ maxPoints, tooManyPoints }) => {
    overlayMessage.value = tooManyPoints ? t("orders.map.messages.Too many stops", { count: maxPoints }) : null;
};

const minPointsInClusterRef = computed(() => minStopsInCluster.value);

const maxPointsRef = computed(() => maxStopsInVisibleArea.value);

const {
    mapInstance,
    mapWithMarkers: ordersMap,
} = useMapWithMarkers<OrdersMapPointFeature, OrdersMapLineFeature, OrdersMapFeature>(
    {
        mapContainer,
        centerRef: center,
        zoomRef: zoom,
        markerClickHandler,
        pointsUpdatedHandler,
        maxPointsRef,
        minPointsInClusterRef
    }
);

const updateOrdersMap = async () => {
    if (!ordersMap.value) {
        return;
    }

    try {
        // the updateMap function itself is not async, but useThrottleFn always returns a Promise
        await ordersMap.value.updateMap(geoFeatures.value);
    } catch (error) {
        if (error === undefined) {
            // if the call got rejected by throttling, it throws without an error object.
            return;
        }
        // rethtrow any other errors
        throw error;
    }

};

watch([geoFeatures, ordersMap, mapInstance], () => {
    updateOrdersMap();
});

</script>
<style scoped lang="scss">
.overlay-message {
    @include normal-medium-text;
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    background: $color-background-warning;
    border: 1px solid $color-border-darker;
    border-radius: $element-border-radius;
    padding: steps(2);
    max-width: steps(50);
    text-align: center;
}
</style>
