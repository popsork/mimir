import type { TransportOrder } from "~/models/TransportOrder";

export const useOrderFormTransportOrderAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getTransportOrder = () => {
        const rows = (form.value.order.transportOrders || []) as TransportOrder[];
        const index = indexFunction();
        return rows[index];
    };

    return {
        getTransportOrder
    };
};


