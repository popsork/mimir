type OrdersMapPointMeta = {
    orderNumber: string,
    transportOrderId: string,
    stopType: StopType,
};
type OrdersMapPointProperties = GeoPointFeatureProperties<OrdersMapPointMeta>;
export type OrdersMapPointFeature = GeoPointFeature<OrdersMapPointProperties>;

// currently orders map lines don't have any meta data, so OrdersMapLineMeta must always be a blank object.
// add keys similary to OrdersMapPointMeta if needed in future
type OrdersMapLineMeta = Record<string, never>;
type OrdersMapLineProperties = GeoLineFeatureProperties<OrdersMapLineMeta>;
export type OrdersMapLineFeature = GeoLineFeature<OrdersMapLineProperties>;

export type OrdersMapFeature = GeoFeature<OrdersMapPointFeature, OrdersMapLineFeature>;

const pointColors: MapPointColors = {
    default: "#164DA7", // $color-map-marker-default
    spiderfied: "#93B7F1", // $color-map-marker-spiderfied
};

// we might have a single order view on the map as well later
export const buildOrdersMapGeoFeatures = (
    {
        groupedOrderRows,
        displayableStopTypes,
        showLines
    }:
    {
        groupedOrderRows: GroupedOrderRows,
        displayableStopTypes: StopType[],
        showLines: boolean,
    }
) => {
    const features: OrdersMapFeature[] = [];

    for (const [orderNumber, orderRows] of Object.entries(groupedOrderRows)) {
        // collect all points for a single order (may include multiple transport orders)
        const orderPointFeatures = buildPointFeatures({ orderNumber, orderRows, displayableStopTypes });

        features.push(...orderPointFeatures);

        if (orderPointFeatures.length < 2) {
            // no lines to build for single-point orders
            continue;
        }

        if (!showLines) {
            continue;
        }

        // build a line based on all included points
        const lineCoordinateList = orderPointFeatures.map(feature => feature.geometry.coordinates);

        const lineFeature: OrdersMapLineFeature = {
            id: orderNumber,
            type: "Feature",
            geometry: { type: "LineString", coordinates: lineCoordinateList },
            properties: {
                color: "#8D92A3", // $color-map-connection-default
                meta: {},
            },
        };
        features.push(lineFeature);
    }

    return features;
};


const buildPointFeatures = (
    { orderNumber, orderRows, displayableStopTypes }:
    {
        orderNumber: string,
        orderRows: OrderRow[],
        displayableStopTypes: StopType[],
    }
) => {
    const pointFeatures: OrdersMapPointFeature[] = [];

    const rowsAndCoordinates = orderRows.map((orderRow: OrderRow) => {
        const rowCoordinates = getOrderRowPickupAndDeliveryCoordinates(orderRow);
        const nonBlankCoordinates = rowCoordinates.filter(pair => pair.every(coordinate => coordinate !== 0));
        return { orderRow, coordinates: nonBlankCoordinates };
    });

    /**
     * coordinate pair can be in the same location per Transport order
     * and remove duplicates if seen in the previous Transport order
     */
    let previousCoordinates = {
        pairKey: "",
        orderRowId: ""
    };

    rowsAndCoordinates.forEach(entry => {
        const { orderRow, coordinates } = entry;
        coordinates.forEach((pair, pairIndex) => {
            const pairKey = JSON.stringify(pair);
            if (pairKey === previousCoordinates.pairKey && orderRow.id === previousCoordinates.orderRowId) {
                return;
            }
            previousCoordinates = { pairKey, orderRowId: orderRow.id };

            const id = `${orderNumber}::${orderRow.id}::${pairIndex}`;
            const lat = pair[0];
            const lng = pair[1];
            const stopType = getStopType({ orderRow, lat, lng });
            if (!displayableStopTypes.includes(stopType)) {
                return;
            }
            const label = getLabelForStopType(stopType);

            const pointFeature: OrdersMapPointFeature = {
                id,
                type: "Feature",
                geometry: { type: "Point", coordinates: [lat, lng] },
                properties: {
                    label,
                    colors: pointColors,
                    meta: {
                        orderNumber,
                        transportOrderId: orderRow.id,
                        stopType,
                    },
                },
            };

            pointFeatures.push(pointFeature);
        });
    });
    return pointFeatures;
};

const getOrderRowPickupAndDeliveryCoordinates = (orderRow: OrderRow): [number, number][] => ([
    [orderRow.pickup_latitude ?? 0, orderRow.pickup_longitude ?? 0],
    [orderRow.delivery_latitude ?? 0, orderRow.delivery_longitude ?? 0]
]);

const getStopType = ({ orderRow, lat, lng }: { orderRow: OrderRow, lat: number, lng: number }) => {
    if (isPickupStop(lat, lng, orderRow)) {
        return StopType.Pickup;
    }

    if (isDeliveryStop(lat, lng, orderRow)) {
        return StopType.Delivery;
    }

    return StopType.Terminal;
};

// customer pickup and delivery can be on the same coordinates and on the same Transport Order
const isPickupStop = (lat: number, lng: number, orderRow: OrderRow) => {
    return String(lat) === String(orderRow.customer_pickup_latitude)
        && String(lng) === String(orderRow.customer_pickup_longitude)
        && (orderRow.transport_order_count === 1 || orderRow.sequence_number === 1);
};

const isDeliveryStop = (lat: number, lng: number, orderRow: OrderRow) => {
    return String(lat) === String(orderRow.customer_delivery_latitude)
        && String(lng) === String(orderRow.customer_delivery_longitude);
};

const getLabelForStopType = (stopType: StopType): string => {
    switch (stopType) {
        case StopType.Pickup:
            return "P";
        case StopType.Delivery:
            return "D";
        case StopType.Terminal:
            return "T";
    }
};



