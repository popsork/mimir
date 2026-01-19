export const useOrdersRowsStore = (() => {

    const fetchRows = async () => {
        return await useApi().getOrderRows();
    };

    const prepareRowForStorage = (row: OrderRow): OrderRow => {
        // convert relevant datetimes to UTC strings to enable string comparison when filtering
        row.created_at_utc = getUtcDatetimeString(row.created_at);
        row.updated_at_utc = getUtcDatetimeString(row.updated_at);
        row.pickup_earliest_at_utc = getUtcDatetimeString(row.pickup_earliest_at);
        row.delivery_latest_at_utc = getUtcDatetimeString(row.delivery_latest_at);

        row.pickup_earliest_at_time = nullifyStartAndEndOfDay(row.pickup_earliest_at_time);
        row.accepted_at_time = nullifyStartAndEndOfDay(row.accepted_at_time);
        row.completed_at_time = nullifyStartAndEndOfDay(row.completed_at_time);
        row.created_at_time = nullifyStartAndEndOfDay(row.created_at_time);
        row.delivery_earliest_at_time = nullifyStartAndEndOfDay(row.delivery_earliest_at_time);
        row.delivery_latest_at_time = nullifyStartAndEndOfDay(row.delivery_latest_at_time);
        row.dispatched_at_time = nullifyStartAndEndOfDay(row.dispatched_at_time);
        row.pickup_latest_at_time = nullifyStartAndEndOfDay(row.pickup_latest_at_time);
        row.planned_at_time = nullifyStartAndEndOfDay(row.planned_at_time);
        row.release_for_invoicing_at_time = nullifyStartAndEndOfDay(row.release_for_invoicing_at_time);
        row.started_at_time = nullifyStartAndEndOfDay(row.started_at_time);
        row.updated_at_time = nullifyStartAndEndOfDay(row.updated_at_time);
        row.last_action_at_time = nullifyStartAndEndOfDay(row.last_action_at_time);
        row.next_action_at_time = nullifyStartAndEndOfDay(row.next_action_at_time);
        row.verified_at_time = nullifyStartAndEndOfDay(row.verified_at_time);

        return row;
    };

    const nullifyStartAndEndOfDay = (timeString: string | null) => {
        if (!timeString) {
            return null;
        }

        if (timeString === "23:59" || timeString === "00:00") {
            return null;
        }

        return timeString;
    };

    return defineTableRowsStore<OrderRow>({
        name: "orders-rows",
        waiterName: WaitingFor.OrderRows,
        indices: ["release_for_invoicing_at_date"],
        fetchRows,
        prepareRowForStorage,
        liveChannelName: "order-table",
        liveEventNames: {
            updated: ".App\\Domains\\OrderList\\Events\\OrderListRowUpdatedEvent",
            created: ".App\\Domains\\OrderList\\Events\\OrderListRowCreatedEvent",
            deleted: ".App\\Domains\\OrderList\\Events\\OrderListRowDeletedEvent"
        },
        collectionUpdateThrottleMs: 2000,

    });

})();


