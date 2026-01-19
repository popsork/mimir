import { InvoicingProcess } from "~/models/InvoicingProcess";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export const useInvoicingProcessStatusChangeStore = defineStore("invoicing-process-status-change", () => {

    type SettableStatus =
        InvoicingProcessStatus.Cancelling
        | InvoicingProcessStatus.Restarting
        | InvoicingProcessStatus.ExternalProcessingDone;

    const getDefaultValues = () => {
        return {
            shouldShowDialog: false,
            processId: null as string | null,
            targetStatus: null as SettableStatus | null,
            errors: new JsonApiErrorCollection(),
        };
    };

    const defaults = getDefaultValues();
    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const processId = ref(defaults.processId);
    const targetStatus = ref(defaults.targetStatus);
    const errors = ref(defaults.errors);

    const waitStore = useWaitStore();

    const waiterName = computed(() => {
        switch (targetStatus.value) {
            case InvoicingProcessStatus.Cancelling:
                return WaitingFor.InvoicingProcessCancelling;
            case InvoicingProcessStatus.Restarting:
                return WaitingFor.InvoicingProcessRestarting;
            case InvoicingProcessStatus.ExternalProcessingDone:
                return WaitingFor.InvoicingProcessMarkingExternalProcessingAsDone;
            default:
                return null;
        }
    });

    const performStatusChange = wrapFunctionInApiErrorHandler(async () => {
        if (!processId.value || !targetStatus.value || !waiterName.value) {
            return;
        }
        // store waiter name in a local variable to ensure it doesn't change during the async operation
        const internalWaiterName = waiterName.value;
        try {
            waitStore.start(internalWaiterName);

            const statusChangeResource = InvoicingProcess.buildStatusChangeApiRequestResource({
                id: processId.value,
                status: targetStatus.value
            });

            await useApi().updateInvoicingProcess(statusChangeResource);
            return true;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                errors.value = displayableErrors;
                return;
            }

            throw error;
        } finally {
            waitStore.end(internalWaiterName);
        }
    });

    const initializeStatusChange = (
        { invoicingProcessId, status }:
        { invoicingProcessId: string, status: SettableStatus }
    ) => {
        clearErrors();
        processId.value = invoicingProcessId;
        targetStatus.value = status;
    };

    const initializeDialog = (
        { invoicingProcessId, status }:
        { invoicingProcessId: string, status: SettableStatus }
    ) => {
        initializeStatusChange({ invoicingProcessId, status });
        shouldShowDialog.value = true;
    };

    const reset = () => {
        clearErrors();
        const defaults = getDefaultValues();
        processId.value = defaults.processId;
        targetStatus.value = defaults.targetStatus;
        shouldShowDialog.value = defaults.shouldShowDialog;
    };

    const clearErrors = () => {
        errors.value = getDefaultValues().errors;
    };

    return {
        processId,
        targetStatus,
        shouldShowDialog,
        errors,

        initializeStatusChange,
        initializeDialog,
        performStatusChange,
        reset
    };
});
