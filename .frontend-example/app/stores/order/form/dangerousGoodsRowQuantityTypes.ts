import { DangerousGoodsRowQuantityType, type DangerousGoodsRowQuantityTypeApiResponseResource } from "~/models/DangerousGoodsRowQuantityType";

export const useOrderFormDangerousGoodsRowQuantityTypesStore = defineStore("order-form-dangerous-goods-row-quantity-types", () => {
    const model = DangerousGoodsRowQuantityType;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormDangerousGoodsRowQuantityTypes;

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
        const apiResponse: { data: DangerousGoodsRowQuantityTypeApiResponseResource[] } = await useApi().getDangerousGoodsRowQuantityTypes();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadQuantityTypesIfNeeded: loadRecordsIfNeeded,
        quantityTypes: records,
        waitingForQuantityTypes: waitingForRecords,
    };
});

