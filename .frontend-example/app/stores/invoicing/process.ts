import { InvoicingProcess, type InvoicingProcessApiResponseResource } from "~/models/InvoicingProcess";

export const useInvoicingProcessStore = defineStore("invoicing-process", () => {

    const waitStore = useWaitStore();

    const getDefaultValues = () => {
        return {
            processId: null as string | null,
            process: new InvoicingProcess(), // always initialize to an empty object to avoid null checks in the components
            processIsMissing: false,
        };
    };

    const defaults = getDefaultValues();

    const processId = ref(defaults.processId);
    const process = ref(defaults.process) as Ref<InvoicingProcess>; // assertion needed for TS to not lose the model type
    const processIsMissing = ref(defaults.processIsMissing);

    const setProcessId = (newValue: string | null) => {
        if (newValue === null) {
            reset();
            return;
        }
        if (newValue !== null && processId.value !== newValue) {
            // only set the id of an existing process if it has changed.
            // because this function may get called multiple times with the same id (when changing tabs in the page)
            processId.value = newValue;
        }
    };

    const loadProcess = async () => {
        if (!processId.value) {
            return;
        }

        try {
            waitStore.start(WaitingFor.InvoicingProcessLoading);

            const processResource = await fetchProcess();

            if (!processResource) {
                processIsMissing.value = true;
                return;
            }

            process.value = InvoicingProcess.fromApiResponse(processResource);

        } finally {
            waitStore.end(WaitingFor.InvoicingProcessLoading);
        }
    };
    watch(processId, () => {
        loadProcess();
    });

    const reloadProcess = () => {
        loadProcess();
    };


    const fetchProcess = wrapFunctionInApiErrorHandler(async () => {
        if (!processId.value) {
            return null;
        }

        let apiResponse: any;
        try {
            apiResponse = await useApi().getInvoicingProcess({ processId: processId.value });
        } catch (error) {
            if (error && error.isAxiosError && error.response?.status === HttpStatus.NotFound) {
                return null;
            } else {
                throw error;
            }
        }

        if (!apiResponse || !apiResponse.data) {
            return null;
        }

        return apiResponse.data as InvoicingProcessApiResponseResource;
    });


    const reset = () => {
        const defaults = getDefaultValues();
        processId.value = defaults.processId;
        process.value = defaults.process;
        processIsMissing.value = defaults.processIsMissing;
    };

    return {
        setProcessId,
        process,
        processIsMissing,
        reloadProcess,
        reset,
    };

});


