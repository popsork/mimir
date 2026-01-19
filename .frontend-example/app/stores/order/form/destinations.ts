import { Destination, type DestinationApiResponseResource } from "~/models/Destination";
import { Location } from "~/models/Location";

export const useOrderFormDestinationsStore = defineStore("order-form-destinations", () => {
    const model = Destination;
    const repo = useRepo(model);
    const locationsRepo = useRepo(Location);
    const waiterName = WaitingFor.OrderFormDestinations;

    const waitStore = useWaitStore();

    const destinations = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const searchQuery = ref("");
    const searchFieldIdentifier = ref("");
    const searchMaxNumberOfDestinations = ref(null as number | null);

    const performSearch = async (
        { query, maxNumberOfDestinations, fieldIdentifier }:
        { query: string, maxNumberOfDestinations: number, fieldIdentifier: string }
    ) => {
        const waiterParams = { query, fieldIdentifier };
        waitStore.start(waiterName, waiterParams);

        try {
            searchQuery.value = query;
            searchFieldIdentifier.value = fieldIdentifier;
            searchMaxNumberOfDestinations.value = maxNumberOfDestinations;
            const records = await fetchDestinations();
            if (searchQuery.value !== query || searchFieldIdentifier.value !== fieldIdentifier) {
                // this response is not to the current/latest query or field, so discard it
                return;
            }

            // note that the same single repo is reused for all location fields and the records are not filtered
            repo.flush();
            repo.insert(records);
            const locations = records.map(record => record.location).filter(record => !!record);
            locationsRepo.flush();
            locationsRepo.insert(locations);
        } finally {
            waitStore.end(waiterName, waiterParams);
        }
    };

    const waitingForSearch = (query: string, fieldIdentifier: string) => {
        return waitStore.is(waiterName, { query, fieldIdentifier });
    };

    const fetchDestinations = async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getDestinations>[0] = {
            searchQuery: searchQuery.value
        };

        if (searchMaxNumberOfDestinations.value) {
            parameters.maxNumberOfResults = searchMaxNumberOfDestinations.value;
        }

        const apiResponse: { data: DestinationApiResponseResource[] } = await apiClient.getDestinations(parameters);

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
        searchQuery,
        destinations,
        performSearch,
        waitingForSearch,
        reset
    };
});

