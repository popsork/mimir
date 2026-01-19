import {
    type Cluster,
    type ClusterStats,
    type Marker,
    MarkerClusterer,
    SuperClusterAlgorithm
} from "@googlemaps/markerclusterer";

export class MapPointClusterer {

    clusterer: MarkerClusterer;

    private expandedPoints = new Map<string, MapPoint>();
    private clusterDestructors: (() => void)[] = [];

    // indicates whether a transition (expand) is in progress
    private transitioning = false;

    constructor(
        private readonly map: google.maps.Map,
        private readonly pointsRegistry: MapPointsRegistry,
        private readonly spiderfiedPointsCapturer: MapSpiderfiedPointsCapturer,
        private minPoints: number,
    ) {
        this.clusterer = this.buildClusterer();
    }

    isExpanded() {
        return this.expandedPoints.size > 0;
    }

    isTransitioning() {
        return this.transitioning;
    }

    getExpandedPointKeys() {
        return new Set(this.expandedPoints.keys());
    }

    addPoints(points: MapPoint[]) {
        const expandedPointKeys = this.getExpandedPointKeys();

        // only add points that are not already owned, not in expanded and not already on the map
        const pointsToAdd = points.filter(point => {
            if (point.map) {
                return false;
            }

            const pointKey = this.pointsRegistry.getPointKey(point);
            if (pointKey && expandedPointKeys.has(pointKey)) {
                return false;
            }

            return true;
        });

        if (!pointsToAdd.length) {
            return;
        }

        const noDraw = true;
        this.clusterer.addMarkers(pointsToAdd, noDraw);
    }

    clear() {
        this.clusterer.clearMarkers();
        this.callClusterContentDestructors();
    }

    private callClusterContentDestructors() {
        this.clusterDestructors.forEach(destructor => destructor());
        this.clusterDestructors = [];
    }

    render() {
        this.clusterer.render();
    }

    removePoints(removablePoints: MapPoint[]) {
        const noDraw = true;
        this.clusterer.removeMarkers(removablePoints, noDraw);

        const newExpandedPoints = new Map<string, MapPoint>();
        this.expandedPoints.forEach((point, pointKey) => {
            if (!removablePoints.includes(point)) {
                newExpandedPoints.set(pointKey, point);
            }
        });

        this.expandedPoints = newExpandedPoints;
    }

    collapseExpanded() {
        if (!this.isExpanded()) {
            return;
        }

        const points = [...this.expandedPoints.values()];
        this.expandedPoints.clear();

        points.forEach(point => {
            point.map = null;
        });

        for (const pointKey of this.spiderfiedPointsCapturer.getSpiderfiedPointKeys()) {
            const position = this.pointsRegistry.getPendingUpdatePointPosition(pointKey);
            if (position) {
                const point = this.pointsRegistry.get(pointKey);
                if (point) {
                    point.position = position;
                }

                this.pointsRegistry.deletePendingUpdatePointPosition(pointKey);
            }
        }

        this.addPoints(points);
        this.render();
    }

    setMinPoints(minPoints: number) {
        this.minPoints = minPoints;

        // clear spiderfied points and expanded cluster if any
        this.spiderfiedPointsCapturer.clearAll();
        if (this.expandedPoints.size > 0) {
            this.collapseExpanded();
        }
        // get all the points from the registry
        const points: MapPoint[] = this.pointsRegistry.getAll() ?? [];

        // destroy the previous clusterer and create a new clusterer
        this.destroy();
        this.clusterer = this.buildClusterer(points);
    }

    destroy() {
        this.clear();
        this.clusterer.setMap(null);
    }

    private buildClusterer(points: MapPoint[] = []): MarkerClusterer {
        return new MarkerClusterer({
            map: this.map,
            markers: points, // since MapPoint type is an extended alias for AdvancedMarkerElement, it can be also used as Marker
            algorithm: this.buildClusterAlgorithm(),
            renderer: {
                render: ({ count, position }, stats: ClusterStats) =>
                    this.buildClusterElement(count, position, stats),
            },
            onClusterClick: (_event, cluster) => this.expandCluster(cluster),
        });
    }

    private buildClusterAlgorithm(): SuperClusterAlgorithm {
        return new SuperClusterAlgorithm({
            minPoints: this.minPoints,
        });
    }

    private buildClusterElement(count: number, position: google.maps.LatLng, stats: ClusterStats): Marker {
        const { node, destructor } = buildMapClusterContent({ count, stats });

        const marker =  new google.maps.marker.AdvancedMarkerElement({
            position,
            content: node,
        });

        // ideally, each individual destructor should be called when the respective cluster is removed,
        // but MarkerClusterer does not provide such hooks, so we keep track of all destructors
        // and call them all when clearing the clusterer or destroying the map
        this.clusterDestructors.push(destructor);
        return marker;
    }

    private expandCluster(cluster: Cluster) {
        this.transitioning = true;

        const { markers, marker } = cluster;
        this.collapseExpanded();

        const points = (markers ?? []) as MapPoint[];
        if (!points.length) {
            return;
        }

        this.removePoints(points);
        if (marker) {
            (marker as MapPoint).map = null;
        }

        points.forEach(point => point.map = this.map);
        google.maps.event.trigger(points[0] as MapPoint, "click");

        const newExpandedPoints = new Map<string, MapPoint>();

        points.forEach(point => {
            const pointKey = this.pointsRegistry.getPointKey(point);
            if (pointKey) {
                newExpandedPoints.set(pointKey, point);
            }
        });

        this.expandedPoints = newExpandedPoints;

        this.clusterer.render();

        this.transitioning = false;
    }
}
