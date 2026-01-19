import { DangerousGoodsRowSubstanceType, type DangerousGoodsRowSubstanceTypeApiResponseResource } from "~/models/DangerousGoodsRowSubstanceType";

export const useOrderFormDangerousGoodsRowSubstanceTypesStore = defineStore("order-form-dangerous-goods-row-substance-types", () => {
    const model = DangerousGoodsRowSubstanceType;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormDangerousGoodsRowSubstanceTypes;

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
        const apiResponse: { data: DangerousGoodsRowSubstanceTypeApiResponseResource[] } = await useApi().getDangerousGoodsRowSubstanceTypes();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadSubstanceTypesIfNeeded: loadRecordsIfNeeded,
        substanceTypes: records,
        waitingForSubstanceTypes: waitingForRecords,
    };
});

