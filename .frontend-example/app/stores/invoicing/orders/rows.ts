export const useInvoicingOrdersRowsStore = (() => {

    const fetchRows = async () => {
        return await useApi().getInvoicingOrderRows();
    };

    const prepareRowForStorage = (row: InvoicingOrderRow): InvoicingOrderRow => {
        // Convert filterable dates to a short date string,
        // these are later used for filtering by date (using string comparison).
        // This formatting will later be done by BE in TMS-1473
        row.created_at_date = getSystemTimeZoneDateString(row.created_at);
        row.updated_at_date = getSystemTimeZoneDateString(row.updated_at);

        return row;
    };

    return defineTableRowsStore<InvoicingOrderRow>({
        name: "invoicing-order-rows",
        waiterName: WaitingFor.InvoicingOrderRows,
        indices: [],
        fetchRows,
        prepareRowForStorage,
        liveChannelName: "invoiceable-order-table",
        liveEventNames: {
            updated: ".App\\Domains\\InvoiceableOrderList\\Events\\InvoiceableOrderListRowUpdatedEvent",
            created: ".App\\Domains\\InvoiceableOrderList\\Events\\InvoiceableOrderListRowCreatedEvent",
            deleted: ".App\\Domains\\InvoiceableOrderList\\Events\\InvoiceableOrderListRowDeletedEvent"
        },
        collectionUpdateThrottleMs: 200,
    });

})();
