import Sylvie from "sylviejs";
import type { Collection } from "sylviejs/database/collection/collection";
import type { CollectionDocument } from "sylviejs/database/collection/collection-document";
import type { CollectionDocumentBase } from "sylviejs/database/collection/collection-document-base";
import type { TableColumnDefinition } from "~/utils/helpers/table/buildTableColumnDefinition";

export type SearchSort = {
    key: string,
    direction: SortingDirection,
};

export default function defineSearchStore<T extends Partial<CollectionDocument>>(storeName: string, scope:SearchScope, availableColumns: Record<string, TableColumnDefinition>) {
    type TDocument = T & CollectionDocumentBase;
    type TSearchResultItem = T & {
        _formatted: T,
    };

    type SearchResponse = {
        totalHits: number,
        hits: TSearchResultItem[],
    };

    return defineStore(storeName, () => {
        const waitStore = useWaitStore();
        const query = ref("");
        const hitCount = ref(0);
        const resultsLoaded = ref(false);
        const filters = ref({ groups: [], operator: FilterLogicalOperator.And } as FilterExpression);
        const sort = ref(null as SearchSort | null);
        const apiClient = useApi();

        const db = new Sylvie(scope.toString());
        const collection = shallowRef(
            db.addCollection("hits") as Collection<TDocument>
        );

        const isLoadingResults = computed(() => waitStore.is(WaitingFor.SearchResults, storeName));
        const columns = computed(() => availableColumns);

        const findQuery = computed(() => getSylvieJSQuery(filters.value));

        const sortOptions = computed(() => {
            if (sort.value) {
                return sort.value;
            }

            return {
                key: "id",
                direction: SortingDirection.Ascending,
            };
        });

        const peek = async () => {
            resultsLoaded.value = false;
            collection.value.clear();
            triggerRef(collection);

            const response = await apiClient.search({ scope, query: query.value, peek: true });
            const result = await response.json() as SearchResponse;

            hitCount.value = result.totalHits;
        };

        const loadHits = async () => {
            resultsLoaded.value = false;
            waitStore.start(WaitingFor.SearchResults, storeName);

            const response = await apiClient.search({ scope, query: query.value, peek: false });
            const result = await response.json() as SearchResponse;

            collection.value.insert(result.hits.map((hit:any) => hit._formatted));
            triggerRef(collection);

            resultsLoaded.value = true;
            waitStore.end(WaitingFor.SearchResults, storeName);
        };

        const loadResultsIfNeeded = () => {
            if (resultsLoaded.value || isLoadingResults.value || !query.value) {
                return;
            }

            loadHits();
        };

        const updateQuery = async (q:string) => {
            query.value = q;
            await peek();
        };

        const tableRows = computed(() => {
            return collection.value
                .chain()
                .find(findQuery.value)
                .simplesort(sortOptions.value.key, sortOptions.value.direction === SortingDirection.Descending)
                .data() as TDocument[];
        });

        return {
            peek,
            hitCount,
            resultsLoaded,
            isLoadingResults,
            loadResultsIfNeeded,
            updateQuery,
            collection,
            columns,
            filters,
            tableRows,
            sort,
        };
    });
}
