import { Service, type ServiceApiResponseResource } from "~/models/Service";

export const useOrderFormServicesStore = defineStore("order-form-services", () => {
    const model = Service;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormServices;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const records = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const mainServices = computed(() => {
        return records.value.filter(service => !service.isAdditional);
    });

    const additionalServices = computed(() => {
        return records.value.filter(service => service.isAdditional);
    });

    const getMainServicesByOperationId = (operationId: string | null) => {
        if (!operationId) {
            return [];
        }
        return mainServices.value.filter(service => service.operationIds.includes(operationId));
    };

    const getAdditionalServicesByOperationId = (operationId: string | null) => {
        if (!operationId) {
            return [];
        }
        return additionalServices.value.filter(service => service.operationIds.includes(operationId));
    };

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
        const apiResponse: { data: ServiceApiResponseResource[] } = await useApi().getServices();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadServicesIfNeeded: loadRecordsIfNeeded,
        additionalServices,
        getMainServicesByOperationId,
        getAdditionalServicesByOperationId,
        waitingForServices: waitingForRecords,
    };
});

