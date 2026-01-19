import { Operation, type OperationApiResponseResource } from "~/models/Operation";

// :NOTE: this store is also used by the orders map filters sidebar, not only the order form.
// if functionality starts to diverge, these should be separated
export const useOrderFormOperationsStore = defineStore("order-form-operations", () => {
    const model = Operation;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormOperations;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const records = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const loadRecordsIfNeeded = () => {
        if (recordsLoaded.value || waitStore.isWaitingFor(waiterName)) {
            return;
        }
        loadRecords();
    };

    const loadRecords = async () => {
        waitStore.start(waiterName);
        try {
            const records = await fetchRecords();

            repo.flush();
            repo.insert(records);
            recordsLoaded.value = true;
        } finally {
            waitStore.end(waiterName);
        }
    };

    const waitingForRecords = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        const apiResponse: { data: OperationApiResponseResource[] } = await useApi().getOperations();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadOperationsIfNeeded: loadRecordsIfNeeded,
        operations: records,
        waitingForOperations: waitingForRecords,
        operationsLoaded: recordsLoaded
    };
});

