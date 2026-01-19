import type { Payee, PayeeApiResponseResource } from "~/models/Payee";
import { SelfBillingPayee } from "~/models/SelfBillingPayee";
import { Unit } from "~/models/Unit";

export const useOrderFormPayeesStore = defineStore("order-form-payees", () => {
    const waiterName = WaitingFor.OrderFormPayees;

    const waitStore = useWaitStore();

    const getDefaultValues = () => {
        return {
            searchQuery: "",
            searchMaxNumberOfPayees: null as number | null,
            payees: [] as Payee[],
        };
    };

    const defaults = getDefaultValues();

    // payees can be either Units or SelfBillingPayees,
    // so instead of using two separate repos, just use an array ref here
    const payees = ref(defaults.payees);

    const searchQuery = ref(defaults.searchQuery);
    const searchMaxNumberOfPayees = ref(defaults.searchMaxNumberOfPayees);

    const performSearch = async (
        { query, maxNumberOfPayees, fieldIdentifier }:
        { query: string, maxNumberOfPayees: number, fieldIdentifier: string }
    ) => {
        const waiterParams = { query, fieldIdentifier };
        waitStore.start(waiterName, waiterParams);
        try {
            searchQuery.value = query;
            searchMaxNumberOfPayees.value = maxNumberOfPayees;
            const records = await fetchPayees();
            if (searchQuery.value !== query) {
                // this response is not to the current/latest query, so discard it
                return;
            }
            payees.value = records;
        } finally {
            waitStore.end(waiterName, waiterParams);
        }
    };

    const waitingForSearch = (query: string, fieldIdentifier: string) => {
        return waitStore.is(waiterName, { query, fieldIdentifier });
    };

    const fetchPayees = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getPayees>[0] = {
            searchQuery: searchQuery.value
        };

        if (searchMaxNumberOfPayees.value) {
            parameters.maxNumberOfResults = searchMaxNumberOfPayees.value;
        }

        const apiResponse: { data: PayeeApiResponseResource[] } = await apiClient.getPayees(parameters);

        const records = apiResponse.data.map(resource => {
            let record: Payee;

            switch (resource.type) {
                case Unit.apiResourceType:
                    record = Unit.fromApiResponse(resource);
                    break;
                case SelfBillingPayee.apiResourceType:
                    record = SelfBillingPayee.fromApiResponse(resource);
                    break;
            }
            return record ?? null;
        }).filter(Boolean);

        return records;
    });


    const reset = () => {
        const defaults = getDefaultValues();
        payees.value = defaults.payees;
        searchQuery.value = defaults.searchQuery;
        searchMaxNumberOfPayees.value = defaults.searchMaxNumberOfPayees;
    };

    return {
        searchQuery,
        payees,
        performSearch,
        waitingForSearch,
        reset
    };
});

