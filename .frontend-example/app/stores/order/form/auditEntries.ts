import { AuditEntry, type AuditEntryApiResponseResource } from "~/models/AuditEntry";

export const useOrderFormAuditEntriesStore = defineStore("order-form-audit-entries", () => {
    const model = AuditEntry;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormAuditEntries;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const records = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const loadRecords = async ({ orderId }: { orderId: string }) => {
        waitStore.start(waiterName);
        try {
            const records = await fetchRecords({ orderId });

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

    const fetchRecords = wrapFunctionInApiErrorHandler(async ({ orderId }: { orderId: string }) => {
        const apiResponse: { data: AuditEntryApiResponseResource[] } = await useApi().getOrderAuditEntries({ orderId });

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.customerOrderId = orderId;
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    const reset = () => {
        repo.flush();
    };

    return {
        loadAuditEntries: loadRecords,
        auditEntries: records,
        waitingForAuditEntries: waitingForRecords,
        reset
    };
});

