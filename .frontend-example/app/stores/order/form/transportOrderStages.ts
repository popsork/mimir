import { TransportOrderStage, type TransportOrderStageApiResponseResource } from "~/models/TransportOrderStage";

export const useOrderFormTransportOrderStagesStore = defineStore("order-form-transport-order-stages", () => {
    const model = TransportOrderStage;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormTransportOrderStages;

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

    const fetchRecords = async () => {
        const apiResponse: { data: TransportOrderStageApiResponseResource[] } = await useApi().getTransportOrderStages();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    };

    return {
        loadStagesIfNeeded: loadRecordsIfNeeded,
        stages: records,
        waitingForStages: waitingForRecords,
    };
});

