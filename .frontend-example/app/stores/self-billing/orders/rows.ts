export const useSelfBillingOrdersRowsStore = (() => {
    const fetchRows = async () => {
        return await useApi().getSelfBillingOrderRows();
    };

    const prepareRowForStorage = (row: SelfBillingOrderRow): SelfBillingOrderRow => {
        // convert relevant datetimes to UTC strings to enable string comparison when filtering
        row.created_at_utc = getUtcDatetimeString(row.created_at);
        row.updated_at_utc = getUtcDatetimeString(row.updated_at);

        return row;
    };

    return defineTableRowsStore<SelfBillingOrderRow>({
        name: "self-billing-order-rows",
        waiterName: WaitingFor.SelfBillingOrderRows,
        indices: [],
        fetchRows,
        prepareRowForStorage,
        liveChannelName: "self-billable-order-table",
        liveEventNames: {
            updated: ".App\\Domains\\SelfBillableOrderList\\Events\\SelfBillableOrderListRowUpdatedEvent",
            created: ".App\\Domains\\SelfBillableOrderList\\Events\\SelfBillableOrderListRowCreatedEvent",
            deleted: ".App\\Domains\\SelfBillableOrderList\\Events\\SelfBillableOrderListRowDeletedEvent"
        },
        collectionUpdateThrottleMs: 200,
    });
})();
