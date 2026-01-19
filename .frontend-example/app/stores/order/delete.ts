import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export const useOrderDeleteStore = defineStore("order-delete", () => {

    const getDefaultValues = () => {
        return {
            shouldShowDialog: false,
            orderId: null as string | null,
            errors: new JsonApiErrorCollection(),
        };
    };

    const defaults = getDefaultValues();
    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const orderId = ref(defaults.orderId);
    const errors = ref(defaults.errors);

    const waitStore = useWaitStore();

    const performOrderDeletion = wrapFunctionInApiErrorHandler(async () => {
        if (!orderId.value) {
            return;
        }
        try {
            waitStore.start(WaitingFor.OrderDeleting);
            await useApi().deleteOrder({ orderId: orderId.value });
            return true;
        } catch (error) {
            if (error.response?.status === HttpStatus.NotFound) {
                // a non-existent order is an ok result, because the order may have already been deleted,
                // so treat it as a successful deletion
                return true;
            }

            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                errors.value = displayableErrors;
                return;
            }

            throw error;
        } finally {
            waitStore.end(WaitingFor.OrderDeleting);
        }
    });
    const initializeDeleteOrderDialog = (customerOrderId: string) => {
        clearErrors();
        orderId.value = customerOrderId;
        shouldShowDialog.value = true;
    };

    const reset = () => {
        clearErrors();
        const defaults = getDefaultValues();
        orderId.value = defaults.orderId;
        shouldShowDialog.value = defaults.shouldShowDialog;
    };

    const clearErrors = () => {
        errors.value = getDefaultValues().errors;
    };

    return {
        orderId,
        shouldShowDialog,
        errors,

        initializeDeleteOrderDialog,
        performOrderDeletion,
        reset
    };
});
