import { Unit, type UnitApiResponseResource } from "~/models/Unit";

// this store is used in multiple places for loading options for unit selection in select fields
// it never contains the full list of units and is only ever loaded based on a specific search query
// used in a specific field as the user is typing

export const useUnitsStore = defineStore("units", () => {
    const model = Unit;
    const repo = useRepo(model);
    const waiterName = WaitingFor.Units;

    const waitStore = useWaitStore();

    const units = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const searchQuery = ref("");
    const searchMaxNumberOfUnits = ref(null as number | null);

    const performSearch = async (
        { query, maxNumberOfUnits, fieldIdentifier }:
        { query: string, maxNumberOfUnits: number, fieldIdentifier: string }
    ) => {
        const waiterParams = { query, fieldIdentifier };
        waitStore.start(waiterName, waiterParams);
        try {
            searchQuery.value = query;
            searchMaxNumberOfUnits.value = maxNumberOfUnits;
            const records = await fetchUnits();
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

    const waitingForSearch = (query: string, fieldIdentifier: string) => {
        return waitStore.is(waiterName, { query, fieldIdentifier });
    };

    const fetchUnits = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getUnits>[0] = {
            searchQuery: searchQuery.value
        };

        if (searchMaxNumberOfUnits.value) {
            parameters.maxNumberOfResults = searchMaxNumberOfUnits.value;
        }

        const apiResponse: { data: UnitApiResponseResource[] } = await apiClient.getUnits(parameters);

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });


    const reset = () => {
        repo.flush();
        searchQuery.value = "";
    };

    return {
        searchQuery,
        units,
        performSearch,
        waitingForSearch,
        reset
    };
});

