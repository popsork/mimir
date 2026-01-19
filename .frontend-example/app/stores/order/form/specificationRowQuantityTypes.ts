import { SpecificationRowQuantityType, type SpecificationRowQuantityTypeApiResponseResource } from "~/models/SpecificationRowQuantityType";

export const useOrderFormSpecificationRowQuantityTypesStore = defineStore("order-form-specification-row-quantity-types", () => {
    const model = SpecificationRowQuantityType;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormSpecificationRowQuantityTypes;

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
        const apiResponse: { data: SpecificationRowQuantityTypeApiResponseResource[] } = await useApi().getSpecificationRowQuantityTypes();

        const records = apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });

        return records;
    });

    return {
        loadQuantityTypesIfNeeded: loadRecordsIfNeeded,
        quantityTypes: records,
        waitingForQuantityTypes: waitingForRecords,
    };
});

