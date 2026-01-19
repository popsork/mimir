
import { startOfDay, endOfDay } from "date-fns";
import type { Collection } from "pinia-orm";
import { CalendarTransportOrder } from "~/models/calendar/TransportOrder";
import { TransportOrder } from "~/models/TransportOrder";

export const useOrdersCalendarOrdersStore = defineStore("orders-calendar-orders", () => {
    const repo = useRepo(CalendarTransportOrder);

    const unitsStore = useOrdersCalendarUnitsStore();
    const { selectedViewUnitIds } = storeToRefs(unitsStore);

    const parametersStore = useOrdersCalendarParametersStore();
    const { firstDate, lastDate } = storeToRefs(parametersStore);

    const unitIdColumn: OrderRowKey = "unit_id";
    const statusColumn: OrderRowKey = "status";
    const startsAtUtcColumn: OrderRowKey = "pickup_earliest_at_utc";
    const endsAtUtcColumn: OrderRowKey = "delivery_latest_at_utc";

    const displayableStatuses = Object.values(TransportOrderStatusName).filter(status => status !== TransportOrderStatusName.Pending);

    // all transport order data is taken from order rows dataset
    const rowsStore = useOrdersRowsStore();

    const orderRowWatcherEnabled = ref(false);

    const relevantOrderRows = computed((): OrderRow[] => {
        if (!orderRowWatcherEnabled.value) {
            // prevent unneeded calculations when the watcher is disabled
            return [];
        }

        return getOrderRows();
    });

    const getOrderRows = () => {
        if (selectedViewUnitIds.value.length < 1) {
            return [];
        }

        const rows: OrderRow[] = rowsStore.collection
            .chain()
            .find(orderRowsQuery.value)
            .data();

        return rows;
    };

    const orderRowsQuery = computed(() => {
        // build a filter query for the order rows dataset based on the selected calendar time period and selected units

        const timeZoneOptions = getSystemTimeZoneOptions();

        const startOfFirstDate = startOfDay(firstDate.value, timeZoneOptions);
        const endOfLastDate = endOfDay(lastDate.value, timeZoneOptions);

        const earliestRelevantTimestamp = getUtcDatetimeString(startOfFirstDate)!;
        const latestRelevantTimestamp = getUtcDatetimeString(endOfLastDate)!;

        return {
            [statusColumn]: { $in: displayableStatuses },
            [unitIdColumn]: { $in: selectedViewUnitIds.value },

            // a row is relevant if it overlaps the selected time period at any point
            [endsAtUtcColumn]: { $gte: earliestRelevantTimestamp },
            [startsAtUtcColumn]: { $lte: latestRelevantTimestamp },
        };
    });

    const relevantTransportOrders = computed(() => {
        return relevantOrderRows.value.map((row: OrderRow) => {
            return CalendarTransportOrder.fromOrderRow(row);
        });
    });

    // this watcher is for detecting changes in the relevant order rows and updating the repo accordingly,
    // but technically it is watching the array of order model instances built from the rows.
    // this might give a small performance boost, because the model instances have far fewer properties than the rows.
    const orderRowWatcher = watch(relevantTransportOrders, (orders) => {
        const relevantIds = orders.map(order => order.id);

        orders.forEach((order) => {
            const existingOrder = repo.find(order.id);
            if (!existingOrder || existingOrder.updatedAt < order.updatedAt) {
                // only save order in the repo if it does not exist there or has a newwer update timestamp.
                // this is needed to prevent redrawing existing calendar items if nothing has changed
                // (for example, to avoid the item's hint flickering while hovering over an item as updates come in)
                // and it also protects from overwriting locally stored changes in the repo if an order watcher gets triggered
                // by an irrelevant update to a different order while this order has its changes being posted to the server
                // and its update has not yet arrived over the websocket
                repo.save(order);
            }
        });

        repo.whereNotIn("id", relevantIds).delete();
    }, { deep: true, immediate: true });

    const startWatchingOrderRows = () => {
        orderRowWatcherEnabled.value = true;
        // when resuming a watcher, it will trigger immediately if there have been any changes during the pause,
        // it will not wait for the next change to happen
        orderRowWatcher.resume();
    };

    const stopWatchingOrderRows = () => {
        orderRowWatcherEnabled.value = false;
        orderRowWatcher.pause();
    };

    const updateStatusAndUnitId = (
        { orderId, unitId, status }:
        { orderId: string, unitId: string | null, status: TransportOrderStatusName }
    ) => {
        // store the new unit and status values in the local repo immediately,
        // so that changes are reflected in the UI without waiting for the row update to arrive over the websocket.

        // see notes about edge cases in updateRecordTimes function below, as those apply here as well.

        const record = getRecordById(orderId);
        if (!record) {
            // record is not currently loaded in calendar store, so no need to update it
            // (unit change might have happened from a different page than calendar, e.g. from order list
            // but this function is still called from the dispatch store)
            return;
        }
        repo.save({ id: orderId, unitId, status });
    };

    const updateRecordTimes = ({ id, startsAt, endsAt } : { id: string, startsAt: string, endsAt: string }) => {
        // store the new values in the local repo immediately,
        // so that changes are reflected in the UI without waiting for the row update to arrive over the websocket.

        // this causes an edge case where an order's times are changed in the UI,
        // and before the update roundtrip has completed, a different update arrives over the websocket
        // for the same order, which triggers the order rows watcher.
        // in that case, if the row has a newer timestamp but still the old start/end times,
        // the order will momentarily jump back to the old position until the correct update arrives,
        // but this is an acceptable compromise for now, as handling this edge case properly is not straightforward.

        // if the API call unexpectedly fails,
        // only the next row update (or a page refresh) will set the times back to the server-stored values

        repo.save({ id, startsAt, endsAt });
        updateRecordTimesInApi({ id, startsAt, endsAt });
    };


    const updateRecordTimesInApi = wrapFunctionInApiErrorHandler(async (
        { id, startsAt, endsAt }:
        { id: string, startsAt: string, endsAt: string }
    ) => {
        const partialResource = TransportOrder.buildTimesUpdateApiRequestResource({ id, startsAt, endsAt });

        // there are no valid error response scenarios, so there is no try/catch to silence any errors
        await useApi().updateTransportOrder(partialResource);
        return true;
    });


    const loadedOrders = computed(() => {
        return repo.all() as Collection<CalendarTransportOrder>;
    });

    const getRecordsForUnit = (unitId: string) => {
        return repo.where("unitId", unitId).get() as Collection<CalendarTransportOrder>;
    };

    const getRecordById = (id: string) => {
        return repo.find(id) as CalendarTransportOrder | null;
    };

    return {
        loadedOrders,
        getRecordsForUnit,
        getRecordById,
        updateRecordTimes,
        updateStatusAndUnitId,

        startWatchingOrderRows,
        stopWatchingOrderRows,
    };
});
