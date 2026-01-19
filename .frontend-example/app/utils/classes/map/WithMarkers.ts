// feature types are based on GeoJSON format https://datatracker.ietf.org/doc/html/rfc7946
type GeoPointFeaturePropertiesMeta = Record<string, any>;
export type GeoPointFeatureProperties<M extends GeoPointFeaturePropertiesMeta = GeoPointFeaturePropertiesMeta> = {
    label: string,
    colors: MapPointColors,
    meta: M,
};
export type GeoPointFeature<P extends GeoPointFeatureProperties = GeoPointFeatureProperties> = {
    // a point's ID should identify it based on business logic, such as an order number + transport order id + pickup vs delivery, or route stop id etc.
    // it should not be based on current coordinate values
    id: string,
    type: "Feature",
    geometry: { type: "Point", coordinates: [number, number] },
    properties: P,
};


type GeoLineFeaturePropertiesMeta = Record<string, any>;
export type GeoLineFeatureProperties<M extends GeoLineFeaturePropertiesMeta = GeoLineFeaturePropertiesMeta> = {
    color: string,
    meta: M,
};
export type GeoLineFeature<P extends GeoLineFeatureProperties = GeoLineFeatureProperties> = {
    // a line's ID should identify it based on the business logic, such as a transport order id, or connectable route stop ids etc.
    // it should not be based on current coordinate values
    id: string,
    type: "Feature",
    geometry: { type: "LineString", coordinates: [number, number][] },
    properties: P,
};

export type GeoFeature<
    PointFeature extends GeoPointFeature,
    LineFeature extends GeoLineFeature
> = PointFeature | LineFeature;

export type MapMarkerClickHandler<PointFeature extends GeoPointFeature> = (
    { event, pointFeature }:
    {
        event: google.maps.MapMouseEvent,
        pointFeature: PointFeature,
    }
) => void;


export type MapPointsUpdatedHandler = (params: { maxPoints: number, tooManyPoints: boolean }) => void;

const MAP_UPDATE_THROTTLE_MS = 500;

export class MapWithMarkers<
    PointFeature extends GeoPointFeature,
    LineFeature extends GeoLineFeature,
    Feature extends GeoFeature<PointFeature, LineFeature> = GeoFeature<PointFeature, LineFeature>
> {
    private readonly map: google.maps.Map;
    private readonly pointsRegistry: MapPointsRegistry;
    private readonly connectionsRegistry: MapConnectionsRegistry;
    private readonly spiderfiedPointsCapturer: MapSpiderfiedPointsCapturer;
    private readonly pointClusterer: MapPointClusterer;
    private geoFeatures: Feature[] = [];
    private readonly markerClickHandler: MapMarkerClickHandler<PointFeature>;
    private maxPoints: number;
    private readonly pointsUpdatedHandler: MapPointsUpdatedHandler | null;
    private hasTooManyVisiblePoints: boolean = false;

    constructor({
        map,
        markerClickHandler,
        pointsUpdatedHandler,
        maxPoints = Infinity,
        minPointsInCluster,
    }: {
        map: google.maps.Map,
        markerClickHandler: MapMarkerClickHandler<PointFeature>,
        pointsUpdatedHandler?: MapPointsUpdatedHandler,
        maxPoints?: number,
        minPointsInCluster: number,
    }) {
        this.map = map;
        this.markerClickHandler = markerClickHandler;
        this.maxPoints = maxPoints;
        this.pointsUpdatedHandler = pointsUpdatedHandler ?? null;

        this.pointsRegistry = new MapPointsRegistry();
        this.connectionsRegistry = new MapConnectionsRegistry(map);
        this.spiderfiedPointsCapturer = new MapSpiderfiedPointsCapturer(map);
        this.pointClusterer = new MapPointClusterer(map, this.pointsRegistry, this.spiderfiedPointsCapturer, minPointsInCluster);
        this.init();
    }

    updateMap = useThrottleFn(
        (geoFeatures: Feature[]) => {
            this.geoFeatures = geoFeatures;
            console.time("MAP_UPDATE_TOOK:");
            this.updatePoints();
            this.updateConnections();
            console.timeEnd("MAP_UPDATE_TOOK:");
            this.syncViewportRender();
        },
        MAP_UPDATE_THROTTLE_MS,
        true, // trailing
        true, // leading
        // we need the last argument (rejectOnCancel) set to true so that callers can know when the update was throttled
        true  // rejectOnCancel
    );

    setMaxPoints(max: number) {
        this.maxPoints = max;
    }

    setMinPointsInCluster(minPointsInCluster: number) {
        this.pointClusterer.setMinPoints(minPointsInCluster);
    }

    async calculateDrivingTimes() {
        type DrivingTime = {
            lineFeature: LineFeature,
            drivingTimeInSeconds: number,
        };
        const drivingTimes = [] as DrivingTime[];

        for (const geoFeature of this.geoFeatures) {
            if (geoFeature.geometry.type !== "LineString") {
                continue;
            }
            const lineFeature = geoFeature as LineFeature;
            const featureId = lineFeature.id;

            const drivingTimeInSeconds = await this.connectionsRegistry.calculateDrivingTimeForConnection(featureId);

            drivingTimes.push({
                lineFeature,
                drivingTimeInSeconds,
            });
        }

        return drivingTimes;
    }

    destroy() {
        // this is needed so that custom marker/cluster components mounted vie mount-vue-component get properly destroyed
        this.pointsRegistry.destroy();
        this.pointClusterer.destroy();
        this.connectionsRegistry.destroy();

    }

    private init(): void {
        this.map.addListener("idle", () => {
            this.syncViewportRender();
        });

        this.spiderfiedPointsCapturer.onSpiderfy((pointKeys) => {
            this.spiderfiedPointsCapturer.setSpiderfiedPointKeys(new Set(pointKeys));
        });

        this.spiderfiedPointsCapturer.onUnspiderfy((pointKeys) => {
            // Special Guard: skip while a transition is in progress to avoid mid-expand collapse and fix maximum call stack overflow.
            if (this.pointClusterer.isTransitioning()) {
                return;
            }

            for (const pointKey of pointKeys) {
                const position = this.pointsRegistry.getPendingUpdatePointPosition(pointKey);
                if (!position) {
                    continue;
                }

                const marker = this.pointsRegistry.get(pointKey);
                if (marker) {
                    marker.position = position;
                }

                this.pointsRegistry.deletePendingUpdatePointPosition(pointKey);
            }

            this.pointClusterer.collapseExpanded();
        });
    }

    private areThereTooManyVisiblePoints(bounds: google.maps.LatLngBounds): boolean {
        const boundsJson = bounds.toJSON();
        const pointFeatures = this.geoFeatures.filter(feature => feature.geometry.type === "Point") as PointFeature[];

        let numberOfPoints = 0;
        for (const pointFeature of pointFeatures) {
            const [lat, lng] = pointFeature.geometry.coordinates;
            const withinBounds = lat >= boundsJson.south && lat <= boundsJson.north && lng >= boundsJson.west && lng <= boundsJson.east;
            if (withinBounds) {
                numberOfPoints++;
                if (numberOfPoints > this.maxPoints) {
                    return true;
                }
            }
        }
        return false;
    }

    private syncViewportRender(): void {
        const visibleArea = this.map.getBounds();
        if (!visibleArea) {
            return;
        }

        this.hasTooManyVisiblePoints = this.areThereTooManyVisiblePoints(visibleArea);
        if (this.pointsUpdatedHandler) {
            this.pointsUpdatedHandler({
                maxPoints: this.maxPoints,
                tooManyPoints: this.hasTooManyVisiblePoints
            });
        }

        if (visibleArea && !this.hasTooManyVisiblePoints) {
            this.connectionsRegistry.showConnectionsWithinArea(visibleArea);
        } else {
            this.connectionsRegistry.hideAllConnections();
        }

        if (this.hasTooManyVisiblePoints) {
            this.spiderfiedPointsCapturer.clearSpiderfied();
            // clear pending update point positions as they are not needed when there are too many points.
            // do not remove any points or connections as they will be reused when zooming, panning
            this.pointsRegistry.clearPendingUpdatePointPositions();
            // finally, clear the clusterer
            this.pointClusterer.clear();
            return;
        }

        if (this.pointClusterer.isExpanded() || this.spiderfiedPointsCapturer.hasSpiderfied()) {
            return;
        }

        let visible = this.pointsRegistry.getPointsWithinArea(visibleArea);
        if (this.pointClusterer.isExpanded()) {
            const expandedKeys = this.pointClusterer.getExpandedPointKeys();
            visible = visible.filter(visiblePoint => {
                const pointKey = this.pointsRegistry.getPointKey(visiblePoint);
                return !pointKey || !expandedKeys.has(pointKey);
            });
        }

        this.pointClusterer.addPoints(visible);
        this.pointClusterer.render();
    }

    private updatePoints() {
        const updatedPointKeys = new Set<string>();

        this.geoFeatures.forEach(geoFeature => {
            if (geoFeature.geometry.type !== "Point") {
                return;
            }

            const pointFeature = geoFeature as PointFeature;

            const featureId = pointFeature.id;

            updatedPointKeys.add(featureId);
            const oldPoint = this.pointsRegistry.get(featureId);

            const coordinates = pointFeature.geometry.coordinates;
            const { label, colors } = pointFeature.properties;

            if (!oldPoint) {
                const newPoint = this.pointsRegistry.buildPoint({
                    coordinates,
                    colors,
                    label,
                });

                this.addPoint(featureId, newPoint);
                this.addMarkerClickHandler({ point: newPoint, pointFeature });
                this.addMarkerFormattingHandler({ point: newPoint });

            } else {
                // note that this does not update the point's label and colors, only position.
                // if label and colors start changing during a point's lifetime, then that needs to be added here
                this.updatePointPositionIfNotIdentical({
                    pointKey: featureId,
                    oldPoint,
                    coordinates,
                });
            }
        });

        this.removeUnneededPoints({ neededPointKeys: updatedPointKeys });
    }

    private updateConnections(): void {
        const updatedConnectionKeys = new Set<MapConnectionKey>();

        this.geoFeatures.forEach(geoFeature => {
            if (geoFeature.geometry.type !== "LineString") {
                return;
            }
            const lineFeature = geoFeature as LineFeature;
            const featureId = lineFeature.id;

            updatedConnectionKeys.add(featureId);

            const coordinates = lineFeature.geometry.coordinates;
            const color = lineFeature.properties.color;

            const oldConnection = this.connectionsRegistry.get(featureId);

            if (!oldConnection) {
                const newConnection = this.connectionsRegistry.buildConnection({ coordinates, color });
                this.connectionsRegistry.add(featureId, newConnection);
            } else {
                this.connectionsRegistry.updateConnectionIfNotIdentical({
                    connectionKey: featureId,
                    coordinates,
                    color
                });
            }
        });

        this.removeUnneededConnections({ neededConnectionKeys: updatedConnectionKeys });
    }

    private addPoint(key: string, point: MapPoint) {
        this.pointsRegistry.add(key, point);
        this.spiderfiedPointsCapturer.add(key, point);
    }

    private updatePointPositionIfNotIdentical(
        { pointKey, oldPoint, coordinates }:
        {
            pointKey: string,
            oldPoint: MapPoint,
            coordinates: [number, number],
        }
    ) {
        const [lat, lng] = coordinates;
        if (oldPoint.position!.lat === lat && oldPoint.position!.lng === lng) {
            return;
        }

        // if the point is spiderfied, do not apply the change here, but record it for later use
        const nextPosition = new google.maps.LatLng({ lat, lng }).toJSON();
        if (this.spiderfiedPointsCapturer.isSpiderfied(pointKey)) {
            this.pointsRegistry.updatePendingUpdatePointPosition(pointKey, nextPosition);
        } else {
            this.pointsRegistry.updatePosition(pointKey, nextPosition);
            this.pointClusterer.render();
        }
    }

    private removeUnneededPoints({ neededPointKeys } : { neededPointKeys : Set<string> }): void {
        const unneededPoints = this.pointsRegistry.getPointsExcept(neededPointKeys);
        if (unneededPoints.size < 1) {
            return;
        }

        this.pointClusterer.removePoints([...unneededPoints.values()]);

        unneededPoints.forEach((point, pointKey) => {
            this.pointsRegistry.delete(pointKey);
            this.spiderfiedPointsCapturer.remove(pointKey);
        });

        this.pointClusterer.render();
    }

    private removeUnneededConnections({ neededConnectionKeys } : { neededConnectionKeys : Set<MapConnectionKey> }) {
        this.connectionsRegistry.deleteUnneededConnections({ neededConnectionKeys });
    }

    private addMarkerClickHandler(
        { point, pointFeature }:
        {
            point: MapPoint,
            pointFeature: PointFeature,
        }
    ) {
        google.maps.event.addListener(point, "spider_click", (mouseEvent: google.maps.MapMouseEvent) => {
            this.markerClickHandler({
                event: mouseEvent,
                pointFeature
            });
        });
    }

    private addMarkerFormattingHandler(
        { point }:
        {
            point: MapPoint,
        }
    ) {
        google.maps.event.addListener(point, "spider_format", (status: MarkerStatus) => {
            const colors = point.colors;

            point.currentColor = (status === MarkerStatus.SPIDERFIED) ? colors.spiderfied : colors.default;
            this.pointsRegistry.refreshPointContent(point);
        });
    }
}
