import { UnitedNationsNumber, type UnitedNationsNumberApiResponseResource } from "~/models/UnitedNationsNumber";

export const useOrderFormUnitedNationsNumbersStore = defineStore("order-form-united-nations-numbers", () => {
    const model = UnitedNationsNumber;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormUnitedNationsNumbers;

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

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        const apiResponse: { data: UnitedNationsNumberApiResponseResource[] } = await useApi().getUnitedNationsNumbers();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadUnitedNationsNumbersIfNeeded: loadRecordsIfNeeded,
        unitedNationsNumbers: records,
    };
});

