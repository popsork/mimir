import { RouteStop } from "~/models/RouteStop";

export const useRouteFormRouteStopsStore = defineStore("route-form-route-stops", () => {
    const settingsStore = useRouteSettingsStore();
    const { defaultOrderHandlingTimeInMinutes } = storeToRefs(settingsStore);

    const formStore = useRouteFormStore();
    const { routeRecord } = storeToRefs(formStore);

    const rowsStore = useOrdersRowsStore();

    const getRouteStopById = (routeStopId: string) => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return null;
        }
        return route.routeStops.find((routeStop) => routeStop.id === routeStopId) || null;
    };

    const getPickupRouteStopByTransportOrderId = (transportOrderId: string | null) => {
        const route = routeRecord.value;
        if (!route.routeStops || !transportOrderId) {
            return null;
        }
        return route.routeStops.find((routeStop) =>
            routeStop.transportOrderId === transportOrderId &&
            routeStop.routeStopType === RouteStopType.Pickup
        ) ?? null;
    };

    const addRouteStop = ({ routeStop, asFirst }: { routeStop: RouteStop, asFirst?: boolean }) => {
        const route = routeRecord.value;

        if (!route.routeStops) {
            route.routeStops = [];
        }

        if (asFirst) {
            route.routeStops.unshift(routeStop);
        } else {
            route.routeStops.push(routeStop);
        }
        formStore.registerRelationshipAddition("RouteStop", routeStop.id);

        fixRouteStopSequenceNumbers();
    };

    const addRouteStopsFromOrderRowId = (orderRowId: string) => {
        const route = routeRecord.value;

        const routeStops = buildRouteStopsFromOrderRowId({ routeId: route.id, orderRowId });

        routeStops.forEach((routeStop) => {
            addRouteStop({ routeStop });
        });
    };

    const buildRouteStopsFromOrderRowId = ({ routeId, orderRowId }: { routeId : string, orderRowId: string }) => {
        const orderRow = rowsStore.getRowById(orderRowId);
        if (!orderRow || !orderRow.pickup_id || !orderRow.delivery_id) {
            return [];
        }

        const pickup = RouteStop.buildBlank({ routeId, routeStopType: RouteStopType.Pickup });
        pickup.transportOrderId = orderRow.id;
        pickup.stopId = orderRow.pickup_id;
        pickup.name = orderRow.pickup_name;
        pickup.city = orderRow.pickup_city;
        pickup.latitude = orderRow.pickup_latitude ?? null;
        pickup.longitude = orderRow.pickup_longitude ?? null;
        pickup.handlingTimeInMinutes = defaultOrderHandlingTimeInMinutes.value;

        const delivery = RouteStop.buildBlank({ routeId, routeStopType: RouteStopType.Delivery });
        delivery.transportOrderId = orderRow.id;
        delivery.stopId = orderRow.delivery_id;
        delivery.name = orderRow.delivery_name;
        delivery.city = orderRow.delivery_city;
        delivery.latitude = orderRow.delivery_latitude ?? null;
        delivery.longitude = orderRow.delivery_longitude ?? null;
        delivery.handlingTimeInMinutes = defaultOrderHandlingTimeInMinutes.value;

        return [pickup, delivery];
    };

    const removeRouteStopById = (routeStopId: string) => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return;
        }

        const removableIndex = route.routeStops.findIndex((routeStop) => routeStop.id === routeStopId);
        if (removableIndex === -1) {
            return;
        }

        route.routeStops.splice(removableIndex, 1);
        formStore.registerRelationshipRemoval("RouteStop", routeStopId);

        fixRouteStopSequenceNumbers();
    };

    const removeRouteStopsByTransportOrderId = (transportOrderId: string) => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return;
        }

        const removableRouteStopIds = route.routeStops
            .filter((routeStop) => routeStop.transportOrderId === transportOrderId)
            .map((routeStop) => routeStop.id)
        ;

        removableRouteStopIds.forEach((routeStopId) => {
            removeRouteStopById(routeStopId);
        });
    };

    const fixRouteStopSequenceNumbers = () => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return;
        }
        route.routeStops.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    const updateDrivingTimes = (drivingTimesInMinutesByRouteStopId: Record<string, number>) => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return;
        }

        route.routeStops.forEach(routeStop => {
            routeStop.drivingTimeInMinutes = drivingTimesInMinutesByRouteStopId[routeStop.id] ?? null;
        });

        recalculateEstimatedArrivals();
    };

    const recalculateEstimatedArrivals = () => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return;
        }

        let nextStopArrivalTime = getSystemTimeZoneDate(route.startAt);

        route.routeStops.forEach(routeStop => {
            if (!routeStop.isPlanned) {
                routeStop.estimatedArrivalAt = null;
                return;
            }

            const drivingMinutes = routeStop.drivingTimeInMinutes ?? 0;
            nextStopArrivalTime = addToSystemTimeZoneDate(nextStopArrivalTime, { minutes: drivingMinutes });

            routeStop.estimatedArrivalAt = getUtcDatetimeString(nextStopArrivalTime);

            const handlingMinutes = routeStop.handlingTimeInMinutes ?? 0;
            nextStopArrivalTime = addToSystemTimeZoneDate(nextStopArrivalTime, { minutes: handlingMinutes });

        });
    };

    const plannedRouteStops = computed(() => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return [];
        }
        return route.routeStops.filter((routeStop) => routeStop.isPlanned);
    });

    const unplannedRouteStops = computed(() => {
        const route = routeRecord.value;
        if (!route.routeStops) {
            return [];
        }
        return route.routeStops.filter((routeStop) => !routeStop.isPlanned);
    });

    // plannedRouteStopIds and unplannedRouteStopIds are arrays of route stop IDs in the correct order.
    // to move a stop around, just set a new array of IDs in the desired order,
    // and the routeRecord's routeStops collections will be updated accordingly, including the sequence numbers
    // (note that the array needs to be replaced in full; modifying the existing array with push etc will not work)
    const plannedRouteStopIds = computed({
        get: () => {
            return plannedRouteStops.value.map((routeStop) => routeStop.id);
        },
        set: (newPlannedStopIds: string[]) => {
            const route = routeRecord.value;
            if (!route.routeStops) {
                return;
            }

            const plannedStops = [] as RouteStop[];

            newPlannedStopIds.forEach((routeStopId) => {
                const routeStop = getRouteStopById(routeStopId);
                if (routeStop) {
                    routeStop.isPlanned = true;
                    plannedStops.push(routeStop);
                }
            });

            const unplannedStops = route.routeStops.filter(routeStop => !newPlannedStopIds.includes(routeStop.id));
            unplannedStops.forEach((routeStop) => {
                routeStop.isPlanned = false;
            });

            route.routeStops = [...plannedStops, ...unplannedStops];
            fixRouteStopSequenceNumbers();
        },
    });

    const unplannedRouteStopIds = computed({
        get: () => {
            return unplannedRouteStops.value.map((routeStop) => routeStop.id);
        },
        set: (newUnplannedStopIds: string[]) => {
            const route = routeRecord.value;
            if (!route.routeStops) {
                return;
            }

            const unplannedStops = [] as RouteStop[];

            newUnplannedStopIds.forEach((routeStopId) => {
                const routeStop = getRouteStopById(routeStopId);
                if (routeStop) {
                    routeStop.isPlanned = false;
                    unplannedStops.push(routeStop);
                }
            });

            const plannedStops = route.routeStops.filter(routeStop => !newUnplannedStopIds.includes(routeStop.id));
            plannedStops.forEach((routeStop) => {
                routeStop.isPlanned = true;
            });

            route.routeStops = [...plannedStops, ...unplannedStops];
            fixRouteStopSequenceNumbers();
        }
    });

    watch([() => routeRecord.value.startAt], () => {
        recalculateEstimatedArrivals();
    });

    return {
        getRouteStopById,
        getPickupRouteStopByTransportOrderId,

        plannedRouteStopIds,
        unplannedRouteStopIds,

        addRouteStop,
        addRouteStopsFromOrderRowId,
        removeRouteStopsByTransportOrderId,
        removeRouteStopById,
        updateDrivingTimes,
        recalculateEstimatedArrivals,
    };
});

