import { Customer, type CustomerApiResponseResource } from "~/models/Customer";


export const useOrderFormCustomersStore = defineStore("order-form-customers", () => {
    const model = Customer;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormCustomers;

    const waitStore = useWaitStore();

    const customers = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const searchQuery = ref("");
    const searchMaxNumberOfCustomers = ref(null as number | null);

    const performSearch = async (
        { query, maxNumberOfCustomers }:
        { query: string, maxNumberOfCustomers: number }
    ) => {
        const waiterParams = { query };
        waitStore.start(waiterName, waiterParams);
        try {
            searchQuery.value = query;
            searchMaxNumberOfCustomers.value = maxNumberOfCustomers;
            const records = await fetchCustomers();
            if (searchQuery.value !== query) {
                // this response is not to the current/latest query, so discard it
                return;
            }
            repo.flush();
            repo.insert(records);
        } finally {
            waitStore.end(waiterName, waiterParams);
        }
    };

    const waitingForSearch = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchCustomers = async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getCustomers>[0] = {
            searchQuery: searchQuery.value
        };

        if (searchMaxNumberOfCustomers.value) {
            parameters.maxNumberOfResults = searchMaxNumberOfCustomers.value;
        }

        const apiResponse: { data: CustomerApiResponseResource[] } = await apiClient.getCustomers(parameters);

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    };

    const reset = () => {
        repo.flush();
        searchQuery.value = "";
    };

    return {
        customers,
        performSearch,
        waitingForSearch,
        reset
    };
});

