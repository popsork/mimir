export type MapPointColors = {
    default: string,
    spiderfied: string,
};

type AdditionalMarkerProperties = {
    // store some additional custom properties on the marker itself for easier access
    destructor?: () => void,
    colors: MapPointColors,
    currentColor: string,
};

export type MapPoint = google.maps.marker.AdvancedMarkerElement & AdditionalMarkerProperties;
type MapPointPosition = google.maps.LatLngLiteral;

export class MapPointsRegistry {
    private readonly points = new Map<string, MapPoint>();
    private readonly pendingUpdatePointPositionsByPointKey = new Map<string, MapPointPosition>();
    private readonly pointKeysByPoint = new WeakMap<MapPoint, string>();

    get(pointKey: string): MapPoint | undefined {
        return this.points.get(pointKey);
    }

    add(key: string, point: MapPoint) {
        this.points.set(key, point);
        this.pointKeysByPoint.set(point, key);
    }

    buildPoint(
        { coordinates, colors, label }:
        {
            coordinates: [number, number],
            colors: MapPointColors,
            label: string,
        }
    ): MapPoint {

        const currentColor = colors.default;
        const { node, destructor } = this.buildPointContent({ label, color: currentColor });

        const point = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: coordinates[0], lng: coordinates[1] },
            title: label,
            content: node
        }) as MapPoint;

        point.destructor = destructor;
        point.colors = colors;
        point.currentColor = currentColor;
        return point;
    }

    buildPointContent({ label, color }: { label: string, color: string }) {
        const { node, destructor } = buildMapMarkerContent({ label, color });
        if (node) {
            node.style.pointerEvents = "none";
        }
        return { node, destructor };
    }

    refreshPointContent(point: MapPoint) {
        const { node, destructor } = this.buildPointContent({
            label: point.title,
            color: point.currentColor
        });

        if (point.destructor) {
            point.destructor();
            point.destructor = undefined;
        }
        point.content = node;
        point.destructor = destructor;
    }


    getAll(): MapPoint[] {
        return [...this.points.values()];
    }

    getPointsExcept(excludablePointKeys: Set<string>): Map<string, MapPoint> {
        const result = new Map<string, MapPoint>();

        this.points.forEach((point, pointKey) => {
            if (!excludablePointKeys.has(pointKey)) {
                result.set(pointKey, point);
            }
        });

        return result;
    }

    getPointsWithinArea(area: google.maps.LatLngBounds): MapPoint[] {
        return [...this.points.values()].filter(point => area.contains(point.position!));
    }

    getPointKey(point: MapPoint): string | undefined {
        return this.pointKeysByPoint.get(point);
    }


    updatePosition(key: string, position: MapPointPosition) {
        const point = this.points.get(key);
        if (!point) {
            return;
        }
        point.position = position;
    }

    delete(pointKey: string) {
        const point = this.points.get(pointKey);
        if (!point) {
            return;
        }

        this.points.delete(pointKey);
        this.pointKeysByPoint.delete(point);
        this.deletePendingUpdatePointPosition(pointKey);
        point.map = null;
        if (point.destructor) {
            point.destructor();
            point.destructor = undefined;
        }
    }


    getPendingUpdatePointPosition(pointKey: string): MapPointPosition | undefined {
        return this.pendingUpdatePointPositionsByPointKey.get(pointKey);
    }

    updatePendingUpdatePointPosition(pointKey: string, position: MapPointPosition) {
        this.pendingUpdatePointPositionsByPointKey.set(pointKey, position);
    }

    deletePendingUpdatePointPosition(pointKey: string) {
        this.pendingUpdatePointPositionsByPointKey.delete(pointKey);
    }

    clearPendingUpdatePointPositions() {
        this.pendingUpdatePointPositionsByPointKey.clear();
    }

    destroy() {
        // this ensures that all points are properly deleted, including calling their destructors
        const pointKeys = this.points.keys();
        for (const pointKey of pointKeys) {
            this.delete(pointKey);
        }
    }
}
