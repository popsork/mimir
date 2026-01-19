import { OrderInvoiceability, type OrderInvoiceabilityApiResponseResource } from "~/models/OrderInvoiceability";

export const useInvoicingOrdersActionsStore = defineStore("invoicing-orders-actions", () => {

    const waitStore = useWaitStore();


    const markOrdersAsInvoiceable = wrapFunctionInApiErrorHandler( async (orderIds: string[]) => {
        waitStore.start(WaitingFor.MarkingOrdersAsInvoiceable);

        // if some of the passed orders are not markable, the API still responds with a 200,
        // and the "results" attribute in the response resource contains details about which orders
        // were successfully marked.
        // non-200 statuses like 422 are only returned if a non-existent order ID is passed or some other
        // actual exception occurs.

        // therefore there are no normal validation error scenarios for this action,
        // so there is no catch block to extract displayable errors
        // and any unexpected error will be thrown to the caller.

        try {
            const creatableRecord = OrderInvoiceability.buildBlank({ orderIds });

            const response = await useApi().createOrderInvoiceability(creatableRecord);

            const resource = response.data as OrderInvoiceabilityApiResponseResource;

            const createdRecord = OrderInvoiceability.fromApiResponse(resource);

            return createdRecord;
        } finally {
            waitStore.end(WaitingFor.MarkingOrdersAsInvoiceable);
        }
    });


    return {
        markOrdersAsInvoiceable,
    };

});

