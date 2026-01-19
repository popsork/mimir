export class MapSpiderfiedPointsCapturer {
    private readonly oms: OverlappingMarkerSpiderfier;
    private readonly points = new Map<string, MapPoint>();
    private readonly pointKeysByPoint = new WeakMap<MapPoint, string>();
    private spiderfiedPointKeys = new Set<string>();

    private readonly listeners = {
        spiderfy: [] as ((keys: string[]) => void)[],
        unspiderfy: [] as ((keys: string[]) => void)[]
    };

    constructor(private readonly map: google.maps.Map) {
        this.oms = new OverlappingMarkerSpiderfier(this.map, {
            basicFormatEvents: true,
            keepSpiderfied: true,
            markersWontMove: true,
            markersWontHide: true,
            nearbyDistance: 25,
            circleSpiralSwitchover: 9,
            circleFootSeparation: 30,
            circleStartAngle: 25,
            legWeight: 2,
            ignoreZoom: true,
        });

        this.registerOmsEventListeners();
    }

    onSpiderfy(cb: (keys: string[]) => void) {
        this.listeners.spiderfy.push(cb);
    }

    onUnspiderfy(cb: (keys: string[]) => void) {
        this.listeners.unspiderfy.push(cb);
    }

    isSpiderfied(key: string): boolean {
        return this.spiderfiedPointKeys.has(key);
    }

    hasSpiderfied(): boolean {
        return this.spiderfiedPointKeys.size > 0;
    }

    clearAll(): void {
        this.spiderfiedPointKeys.clear();
        this.oms.unspiderfy();
    }

    getSpiderfiedPointKeys() {
        return this.spiderfiedPointKeys;
    }

    add(pointKey: string, point: MapPoint) {
        this.points.set(pointKey, point);
        this.pointKeysByPoint.set(point, pointKey);
        this.oms.addMarker(point);
    }

    setSpiderfiedPointKeys(pointKeys: Set<string>) {
        this.spiderfiedPointKeys = pointKeys;
    }

    remove(pointKey: string): void {
        this.spiderfiedPointKeys.delete(pointKey);

        const point = this.points.get(pointKey);
        if (!point) {
            return;
        }

        this.points.delete(pointKey);
        this.pointKeysByPoint.delete(point);
        this.oms.removeMarker(point);
    }

    clearSpiderfied(): void {
        this.spiderfiedPointKeys.clear();
        this.oms.unspiderfy();
    }

    private registerOmsEventListeners() {

        this.oms.addListener("spiderfy", (points: MapPoint[]) => {
            this.spiderfiedPointKeys.clear();
            for (const point of points) {
                const pointKey = this.pointKeysByPoint.get(point);
                if (pointKey) {
                    this.spiderfiedPointKeys.add(pointKey);
                }
            }
            const keys = [...this.spiderfiedPointKeys];
            this.listeners.spiderfy.forEach(fn => fn(keys));
        });

        this.oms.addListener("unspiderfy", () => {
            const keys = [...this.spiderfiedPointKeys];
            this.spiderfiedPointKeys.clear();
            this.listeners.unspiderfy.forEach(fn => fn(keys));
        });

    }
}
