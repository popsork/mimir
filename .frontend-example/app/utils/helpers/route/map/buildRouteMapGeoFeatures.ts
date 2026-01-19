import type { RouteStop } from "~/models/RouteStop";

type RouteMapPointMeta = {
    routeStop: RouteStop,
};
type RouteMapPointProperties = GeoPointFeatureProperties<RouteMapPointMeta>;
export type RouteMapPointFeature = GeoPointFeature<RouteMapPointProperties>;

type RouteMapLineMeta = {
    originRouteStop: RouteStop,
    destinationRouteStop: RouteStop,
    containsSkippedStops: boolean,
};
type RouteMapLineProperties = GeoLineFeatureProperties<RouteMapLineMeta>;
export type RouteMapLineFeature = GeoLineFeature<RouteMapLineProperties>;

export type RouteMapFeature = GeoFeature<RouteMapPointFeature, RouteMapLineFeature>;

const pointColors: MapPointColors = {
    default: "#164DA7", // $color-map-marker-default
    spiderfied: "#93B7F1", // $color-map-marker-spiderfied
};

const lineColors = {
    direct: "#164DA7", // $color-map-connection-planned
    incomplete: "#F37676", // $color-map-connection-error
};

export const buildRouteMapGeoFeatures = (
    {
        orderedRouteStops
    }:
    {
        orderedRouteStops: RouteStop[],
    }
) => {
    const features: RouteMapFeature[] = [];

    // add all route stops having coordinates as point features
    orderedRouteStops.forEach((routeStop) => {
        const pointFeature = buildPointFeature(routeStop);
        if (!pointFeature) {
            return;
        }
        features.push(pointFeature);
    });

    // add sequential lines between planned route stops
    let previousStop: RouteStop | null = null;
    let somePlannedStopsSkipped = false;
    orderedRouteStops.forEach((routeStop) => {
        if (!routeStop.isPlanned) {
            return;
        }
        if (!previousStop) {
            if (routeStop.hasCoordinates()) {
                previousStop = routeStop;
            }
            return;
        }
        if (!routeStop.hasCoordinates()) {
            // if a planned stop has no coordinates,
            // we skip it and draw the line to the next one instead, coloring the line differently
            somePlannedStopsSkipped = true;
            return;
        }
        const lineFeature = buildRouteMapLineFeature({
            from: previousStop,
            to: routeStop,
            containsSkippedStops: somePlannedStopsSkipped
        });
        features.push(lineFeature);
        previousStop = routeStop;
        somePlannedStopsSkipped = false;
    });

    return features;
};

const buildPointFeature = (routeStop: RouteStop) => {
    if (!routeStop.hasCoordinates()) {
        return null;
    }
    const id = routeStop.id;
    const label = getLabelForRouteStop(routeStop);

    const pointFeature: RouteMapPointFeature = {
        id,
        type: "Feature",
        geometry: { type: "Point", coordinates: [routeStop.latitude!, routeStop.longitude!] },
        properties: {
            label,
            colors: pointColors,
            meta: {
                routeStop,
            }
        }
    };

    return pointFeature;
};

const getLabelForRouteStop = (routeStop: RouteStop): string => {
    switch (routeStop.routeStopType) {
        case RouteStopType.Pickup:
            return "P";
        case RouteStopType.Delivery:
            return "D";
        case RouteStopType.Manual:
            return "S";
    }
};

const buildRouteMapLineFeature = (
    { from, to, containsSkippedStops }:
    {
        from: RouteStop,
        to: RouteStop,
        containsSkippedStops: boolean,
    }
)=> {
    const id = `${from.id}::${to.id}`;
    const color = containsSkippedStops ? lineColors.incomplete : lineColors.direct;

    const lineFeature: RouteMapLineFeature = {
        id,
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [
                // stops without coordinates should not reach this point, so we can assert non-null here
                [from.latitude!, from.longitude!],
                [to.latitude!, to.longitude!],
            ]
        },
        properties: {
            color,
            meta: {
                originRouteStop: from,
                destinationRouteStop: to,
                containsSkippedStops,
            },
        },
    };

    return lineFeature;
};

