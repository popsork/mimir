import { Article, type ArticleApiResponseResource } from "~/models/Article";

export const useOrderFormArticlesStore = defineStore("order-form-articles", () => {
    const model = Article;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormArticles;

    const waitStore = useWaitStore();

    const articles = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const searchQuery = ref("");
    const searchProjectId = ref(null as string | null);
    const searchArticleGroupId = ref(null as string | null);
    const searchMaxNumberOfArticles = ref(null as number | null);

    const performSearch = async (
        { query, projectId, articleGroupId, maxNumberOfArticles, debitRowId }:
        { query: string, projectId: string | null, articleGroupId: string | null, maxNumberOfArticles: number, debitRowId: string }
    ) => {
        const waiterParams = { query, debitRowId };
        waitStore.start(waiterName, waiterParams);
        try {
            searchQuery.value = query;
            searchProjectId.value = projectId;
            searchArticleGroupId.value = articleGroupId;
            searchMaxNumberOfArticles.value = maxNumberOfArticles;
            const records = await fetchArticles();
            if (searchQuery.value !== query || searchProjectId.value !== projectId || searchArticleGroupId.value !== articleGroupId) {
                // this response is not to the current/latest query, so discard it
                return;
            }
            repo.flush();
            repo.insert(records);
        } finally {
            waitStore.end(waiterName, waiterParams);
        }
    };

    const waitingForSearch = (query: string, debitRowId: string) => {
        return waitStore.is(waiterName, { query, debitRowId });
    };

    const fetchArticles = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getArticles>[0] = {
            searchQuery: searchQuery.value,
            projectId: searchProjectId.value,
            articleGroupId: searchArticleGroupId.value
        };

        if (searchMaxNumberOfArticles.value) {
            parameters.maxNumberOfResults = searchMaxNumberOfArticles.value;
        }

        const apiResponse: { data: ArticleApiResponseResource[] } = await apiClient.getArticles(parameters);

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
        articles,
        performSearch,
        waitingForSearch,
        reset
    };
});

