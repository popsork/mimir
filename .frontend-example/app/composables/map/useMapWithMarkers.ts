
// using regular function definition instead of arrow function to allow proper typing when used as a composable,
// as arrow functions may lose some type inference capabilities accross module boundaries
export function useMapWithMarkers<
    PointFeature extends GeoPointFeature,
    LineFeature extends GeoLineFeature,
    Feature extends GeoFeature<PointFeature, LineFeature> = GeoFeature<PointFeature, LineFeature>
>(
    {
        mapContainer,
        centerRef,
        zoomRef,
        markerClickHandler,
        pointsUpdatedHandler,
        maxPointsRef,
        minPointsInClusterRef,
    }:
    {
        mapContainer: Ref<HTMLElement | null>,
        centerRef: Ref<{ lat: number, lng: number }>,
        zoomRef: Ref<number>,
        markerClickHandler: MapMarkerClickHandler<PointFeature>,
        pointsUpdatedHandler?: MapPointsUpdatedHandler,
        maxPointsRef?: Ref<number>,
        minPointsInClusterRef: Ref<number>,
    }
) {

    const { $loadGoogleMaps } = useNuxtApp();
    const config = useConfiguration();

    const mapInstance = shallowRef(null as google.maps.Map | null);

    const mapWithMarkers = shallowRef(null as MapWithMarkers<PointFeature, LineFeature, Feature> | null);

    const centerWatcher = watch(centerRef, () => {
        if (!mapInstance.value) {
            return;
        }

        mapInstance.value.setCenter(centerRef.value);
    });

    watch(zoomRef, () => {
        if (!mapInstance.value) {
            return;
        }

        if (zoomRef.value !== mapInstance.value.getZoom()) {
            mapInstance.value.setZoom(zoomRef.value);
        }
    });

    onMounted(async () => {

        await $loadGoogleMaps({ libraries: ["places", "marker"] });
        mapInstance.value = new google.maps.Map(mapContainer.value!, {
            center: centerRef.value,
            zoom: zoomRef.value,
            mapId: config.googleMapId,
            renderingType: google.maps.RenderingType.RASTER
        });

        mapInstance.value.addListener("dragstart", () => {
            centerWatcher.pause();
        });

        mapInstance.value.addListener("dragend", () => {
            centerWatcher.resume();
        });

        mapInstance.value.addListener("zoom_changed", () => {
            if (!mapInstance.value) {
                return;
            }

            const newZoom = mapInstance.value.getZoom();
            if (!newZoom) {
                return;
            }

            if (newZoom === zoomRef.value) {
                return;
            }
            zoomRef.value = newZoom;
        });

        mapInstance.value.addListener("center_changed", () => {
            if (!mapInstance.value) {
                return;
            }

            const newCenter = mapInstance.value.getCenter();
            if (!newCenter) {
                return;
            }

            const newCenterFingerprint = [String(newCenter.lat()), String(newCenter.lng())].join(",");
            const storedCenterFingerprint = [String(centerRef.value.lat), String(centerRef.value.lng)].join(",");
            if (newCenterFingerprint === storedCenterFingerprint) {
                return;
            }

            centerRef.value = { lat: newCenter.lat(), lng: newCenter.lng() };
        });

        mapWithMarkers.value = new MapWithMarkers<PointFeature, LineFeature, Feature>({
            map: mapInstance.value,
            markerClickHandler,
            pointsUpdatedHandler,
            maxPoints: maxPointsRef ? maxPointsRef.value : undefined,
            minPointsInCluster: minPointsInClusterRef.value,
        });

        watch(minPointsInClusterRef, (newMinPointsInCluster) => {
            if (mapWithMarkers.value) {
                mapWithMarkers.value.setMinPointsInCluster(newMinPointsInCluster);
            }
        });

        if (maxPointsRef) {
            watch(maxPointsRef, (newMaxPoints) => {
                if (mapWithMarkers.value) {
                    mapWithMarkers.value.setMaxPoints(newMaxPoints);
                }
            });
        }

    });

    onBeforeUnmount(() => {
        if (mapWithMarkers.value) {
            mapWithMarkers.value.destroy();
            mapWithMarkers.value = null;
        }

        if (mapInstance.value) {
            mapInstance.value = null;
        }
    });

    return {
        mapInstance,
        mapWithMarkers,
    };
}
