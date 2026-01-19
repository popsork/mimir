import { useSearchDeviationsStore } from "~/stores/search/deviations";

export type FilterableScope = {
    key: SearchScope,
    hits: number,
};

export const useSearchStore = defineStore("search", () => {
    const waitStore = useWaitStore();
    const query = ref(null as string | null);
    const subQuery = ref(null as string | null);
    const availableScopes = ref(Object.values(SearchScope));
    const selectedScope = ref(SearchScope.Orders);

    const searchOrdersStore = useSearchOrdersStore();
    const searchCustomersStore = useSearchCustomersStore();
    const searchArticlesStore = useSearchArticlesStore();
    const searchSpecificationsStore = useSearchSpecificationsStore();
    const searchDeviationsStore = useSearchDeviationsStore();

    const resetFilters = () => {
        selectedScope.value = SearchScope.Orders;
        waitStore.end(WaitingFor.Search);
    };

    const performSearch = async () => {
        const q = query.value;

        if (!q) {
            resetFilters();
            return;
        }

        waitStore.start(WaitingFor.Search);

        try {
            await Promise.all([
                searchOrdersStore.updateQuery(q),
                searchArticlesStore.updateQuery(q),
                searchCustomersStore.updateQuery(q),
                searchSpecificationsStore.updateQuery(q),
                searchDeviationsStore.updateQuery(q),
            ]);
        } finally {
            waitStore.end(WaitingFor.Search);
        }
    };

    const getStoreForScope = (scope: SearchScope) => {
        switch (scope) {
            case SearchScope.Orders: return searchOrdersStore;
            case SearchScope.Customers: return searchCustomersStore;
            case SearchScope.Articles: return searchArticlesStore;
            case SearchScope.Specifications: return searchSpecificationsStore;
            case SearchScope.Deviations: return searchDeviationsStore;
        }
    };

    const filterableScopes = computed(() => {
        return availableScopes.value.map((scope) => {
            const store = getStoreForScope(scope);
            return {
                key: scope,
                hits: store.hitCount || 0,
            };
        }) as FilterableScope[];
    });


    watch(query, () => {
        performSearch();
    });

    return {
        query,
        subQuery,
        performSearch,
        resetFilters,
        filterableScopes,
        selectedScope,
        getStoreForScope,
    };
});
