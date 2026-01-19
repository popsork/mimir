export const useRouteMapStore = defineStore("route-map", () => {
    const config = useConfiguration();
    const routeFormStore = useRouteFormStore();
    const { routeRecord } = storeToRefs(routeFormStore);

    // reuse default center and zoom values from orders map configuration,
    // as we currently do not have separate settings for route map.
    // ideally, the map should initially center and zoom to fit all stop points of the loaded route,
    // but that can be implemented later if needed.
    const getDefaultCenter = () => ({
        lat: parseFloat(config.ordersMapCenterLat || "0"),
        lng: parseFloat(config.ordersMapCenterLng || "0"),
    });

    const getDefaultZoom = () => parseInt(config.ordersMapInitialZoomLevel || "8");

    const center = ref(getDefaultCenter());
    const zoom = ref(getDefaultZoom());

    const geoFeatures = computed(() => {
        return buildRouteMapGeoFeatures({
            orderedRouteStops: routeRecord.value.routeStops ?? [],
        });
    });

    return {
        center,
        zoom,
        geoFeatures,
    };
});
