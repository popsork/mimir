import { Waybill, type WaybillApiResponseResource } from "~/models/Waybill";

export const useOrderFormWaybillsStore = defineStore("order-form-waybills", () => {
    const model = Waybill;
    const waiterName = WaitingFor.OrderFormWaybillNumber;

    const waitStore = useWaitStore();

    const createWaybill = wrapFunctionInApiErrorHandler(async () => {
        waitStore.start(waiterName);
        try {
            const apiResponse: { data: WaybillApiResponseResource } = await useApi().createWaybill();

            const record = model.fromApiResponse(apiResponse.data);

            return record;
        } catch (error) {
            if (error?.isApiError && error.response?.status === HttpStatus.NotFound) {
                // a 404 response means a new waybill could not be generated (probably no active series is available)
                return false;
            }
            throw error;
        } finally {
            waitStore.end(waiterName);
        }
    });

    return {
        createWaybill,
    };
});

