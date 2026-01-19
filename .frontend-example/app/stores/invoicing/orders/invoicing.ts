import { InvoicingProcess, type InvoicingProcessApiResponseResource } from "~/models/InvoicingProcess";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export const useInvoicingOrdersInvoicingStore = defineStore("invoicing-orders-invoicing", () => {
    const waiterName = WaitingFor.InvoicingProcessCreation;
    const waitStore = useWaitStore();

    const getDefaultValues = () => {
        const now = new Date();
        return {
            formMode: null as "by-profile" | "by-orders" | null,
            form: {
                invoicingDate: getSystemTimeZoneDateString(now),
                bookkeepingDate: getSystemTimeZoneDateString(now),
                invoicingProfileId: null as string | null,
                errors: new JsonApiErrorCollection()
            }
        };
    };

    const defaults = ref(getDefaultValues());
    const formMode = ref(defaults.value.formMode);
    const form = ref(defaults.value.form);

    const invoicingByProfile = computed(() => formMode.value === "by-profile");
    const invoicingByOrders = computed(() => formMode.value === "by-orders");

    const initializeInvoicingByProfile = () => {
        reset();
        formMode.value = "by-profile";
    };

    const initializeInvoicingByOrders = () => {
        reset();
        formMode.value = "by-orders";
    };

    const tableStore = useInvoicingOrdersTableStore();
    const { selectedRowIds } = storeToRefs(tableStore);

    const startInvoicing = wrapFunctionInApiErrorHandler(async () => {
        const creatableRecord = buildInvoicingProcess();

        waitStore.start(waiterName);
        try {
            const apiResponse: { data: InvoicingProcessApiResponseResource } = await useApi().createInvoicingProcess(creatableRecord);
            const record = InvoicingProcess.fromApiResponse(apiResponse.data);

            return record;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                form.value.errors = displayableErrors;
            } else {
                clearFormErrors();
                throw error;
            }
        } finally {
            waitStore.end(waiterName);
        }
    });

    const buildInvoicingProcess = () => {
        const process = InvoicingProcess.buildBlank();
        process.invoiceDate = form.value.invoicingDate;
        process.bookkeepingDate = form.value.bookkeepingDate;
        if (formMode.value === "by-profile") {
            process.invoicingProfileId = form.value.invoicingProfileId;
        }
        if (formMode.value === "by-orders") {
            process.orderIds = selectedRowIds.value.map(id => id.toString());
        }
        return process;
    };

    const clearFormErrors = () => {
        form.value.errors = getDefaultValues().form.errors;
    };

    const reset = () => {
        const defaults = getDefaultValues();
        formMode.value = defaults.formMode;
        form.value = defaults.form;
    };

    return {
        form,
        formMode,
        invoicingByProfile,
        invoicingByOrders,
        initializeInvoicingByProfile,
        initializeInvoicingByOrders,
        startInvoicing,
        reset,
    };

});



