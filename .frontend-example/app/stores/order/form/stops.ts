
import { TransportOrder } from "~/models/TransportOrder";
import { Stop } from "~/models/Stop";

export const useOrderFormStopsStore = defineStore("order-form-stops", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const { removeAllDebitRowsForTransportOrder } = useOrderFormDebitRowsStore();

    const addStop = (
        { beforeStopIndex, beforePreviousTransportOrder }:
        { beforeStopIndex: number, beforePreviousTransportOrder: boolean }
    ) => {
        const order = form.value.order;

        if (!order.stops) {
            order.stops = [];
        }

        if (!order.transportOrders) {
            order.transportOrders = [];
        }

        const existingTransportOrders = order.transportOrders as TransportOrder[];

        if (beforeStopIndex < 0 || beforeStopIndex > order.stops!.length) {
            return;
        }

        const addingAtStart = (beforeStopIndex === 0);
        const addingAtEnd = (beforeStopIndex === order.stops!.length);
        // when adding at the start or the end, the beforePrevious option needs to be forced
        if (addingAtStart) {
            beforePreviousTransportOrder = false;
        }
        if (addingAtEnd) {
            beforePreviousTransportOrder = true;
        }

        const nextStop = getStopByIndex(beforeStopIndex);
        const previousStop = getStopByIndex(beforeStopIndex - 1);

        const newStop = buildNewStop({ customerOrderId: order.id, beforeStopIndex });

        // an existing transport order that gets affected by the new stop needs one of its endpoints set to the new stop
        // but only if the new stop is not being added at the start or the end of the list
        const affectedTransportOrder = existingTransportOrders[beforeStopIndex - 1]; // will be undefined if adding at start or end
        if (affectedTransportOrder) {
            if (beforePreviousTransportOrder) {
                affectedTransportOrder.pickupStopId = newStop.id;
            } else {
                affectedTransportOrder.deliveryStopId = newStop.id;
            }
        }

        // some values will need to be duplicated from an existing transport order.
        // if adding in the middle of the list, it is the same one as the affectedTransportOrder.
        // if adding at the start or the end, it is the first or the last transport order respectively
        let sourceTransportOrder: TransportOrder;

        if (affectedTransportOrder) {
            sourceTransportOrder = affectedTransportOrder;
        } else if (addingAtStart) {
            sourceTransportOrder = existingTransportOrders[0]!;
        } else {
            sourceTransportOrder = existingTransportOrders[existingTransportOrders.length - 1]!;
        }

        const newTransportOrder = buildNewTransportOrder({
            customerOrderId: order.id,
            pickupStopId: (beforePreviousTransportOrder) ? previousStop!.id : newStop.id,
            deliveryStopId: (beforePreviousTransportOrder) ? newStop.id : nextStop!.id,
            sourceTransportOrder
        });

        const beforeTransportOrderIndex = (beforePreviousTransportOrder) ? beforeStopIndex - 1 : beforeStopIndex;
        order.stops.splice(beforeStopIndex, 0, newStop);
        order.transportOrders.splice(beforeTransportOrderIndex, 0, newTransportOrder);

        registerAddition({ stopId: newStop.id, transportOrderId: newTransportOrder.id });

        fixStopSequenceNumbers();
    };

    const buildNewStop = ({ customerOrderId, beforeStopIndex }: { customerOrderId: string, beforeStopIndex: number }) => {
        const sequenceNumber = beforeStopIndex + 1;
        return Stop.buildBlank({ customerOrderId, sequenceNumber });
    };



    const buildNewTransportOrder = (
        { customerOrderId, pickupStopId, deliveryStopId, sourceTransportOrder }:
        { customerOrderId: string, pickupStopId: string, deliveryStopId: string, sourceTransportOrder: TransportOrder }
    ) => {
        const newOrder = TransportOrder.buildBlank({ customerOrderId, pickupStopId, deliveryStopId });

        // some values for the newly added transport order need to be copied from the previously existing transport order
        newOrder.driverInstructions = sourceTransportOrder.driverInstructions;
        newOrder.operationId = sourceTransportOrder.operationId;
        newOrder.operation = sourceTransportOrder.operation;

        return newOrder;
    };



    const getStopByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.stops || !order.stops[index]) {
            return null;
        }
        return order.stops[index] as Stop;
    };

    const getTransportOrderByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.transportOrders || !order.transportOrders[index]) {
            return null;
        }
        return order.transportOrders[index] as TransportOrder;
    };

    const getTransportOrderById = (id: string) => {
        const order = form.value.order;
        if (!order.transportOrders) {
            return null;
        }
        const transportOrder = order.transportOrders.find(order => order.id === id) as TransportOrder | undefined;
        return transportOrder || null;
    };

    const getStopById = (id: string) => {
        const order = form.value.order;
        if (!order.stops) {
            return null;
        }
        return order.stops.find(stop => stop.id === id) || null;
    };

    const removableTransportOrderId = ref(null as string | null);

    const removableStops = computed(() => {
        // this returns the possible options for which stop should be removed along with the removable transport order.
        // either the previous (pickup) or the next (delivery) stop can be removed.
        // it is allowed to remove the first and the last stop in the list as well (main order endpoints)
        const stops = [] as Stop[];
        if (!removableTransportOrderId.value) {
            return stops;
        }
        const transportOrder = getTransportOrderById(removableTransportOrderId.value);
        if (!transportOrder) {
            return stops;
        }

        if (transportOrder.pickupStopId) {
            const previousStop = getStopById(transportOrder.pickupStopId);

            if (previousStop) {
                stops.push(previousStop as Stop);
            }
        }

        if (transportOrder.deliveryStopId) {
            const nextStop = getStopById(transportOrder.deliveryStopId);

            if (nextStop) {
                stops.push(nextStop as Stop);
            }
        }

        return stops;
    });


    const setRemovableTransportOrderId = (id: string) => {
        removableTransportOrderId.value = id;
    };

    const clearRemovableTransportOrderId = () => {
        removableTransportOrderId.value = null;
    };

    const removeTransportOrderAndStop = (
        { transportOrderId, stopId }:
        { transportOrderId: string, stopId: string }
    ) => {
        const order = form.value.order;

        const removableTransportOrder = getTransportOrderById(transportOrderId);
        if (!removableTransportOrder) {
            return;
        }
        const transportOrderIndex = order.transportOrders!.findIndex(order => order.id === transportOrderId);

        const stopIndex = order.stops!.findIndex(stop => stop.id === stopId);
        if (stopIndex < 0) {
            return;
        }

        if (removableTransportOrder.pickupStopId === stopId) {
            // removing pickup stop, so the previous transport order's delivery stop should be updated,
            // unless this is the first transport order
            if (transportOrderIndex > 0) {
                order.transportOrders![transportOrderIndex - 1]!.deliveryStopId = removableTransportOrder.deliveryStopId;
            }
        }

        if (removableTransportOrder.deliveryStopId === stopId) {
            // removing delivery stop, so the next transport order's pickup stop should be updated
            // unless this is the last transport order
            if (transportOrderIndex < order.transportOrders!.length - 1) {
                order.transportOrders![transportOrderIndex + 1]!.pickupStopId = removableTransportOrder.pickupStopId;
            }
        }

        removeAllDebitRowsForTransportOrder(transportOrderId);

        order.transportOrders!.splice(transportOrderIndex, 1);
        order.stops!.splice(stopIndex, 1);

        registerRemoval({ stopId, transportOrderId });

        fixStopSequenceNumbers();
    };

    const registerAddition = (
        { stopId, transportOrderId }:
        { stopId: string, transportOrderId: string }
    ) => {
        formStore.registerRelationshipAddition("Stop", stopId);
        formStore.registerRelationshipAddition("TransportOrder", transportOrderId);
    };

    const registerRemoval = (
        { stopId, transportOrderId }:
        { stopId: string, transportOrderId: string }
    ) => {
        formStore.registerRelationshipRemoval("Stop", stopId);
        formStore.registerRelationshipRemoval("TransportOrder", transportOrderId);
    };

    const fixStopSequenceNumbers = () => {
        const order = form.value.order;
        if (!order.stops) {
            return;
        }
        order.stops.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    return {
        addStop,

        getTransportOrderByIndex,
        getTransportOrderById,

        removableTransportOrderId,
        setRemovableTransportOrderId,
        clearRemovableTransportOrderId,

        removableStops,

        removeTransportOrderAndStop
    };
});

