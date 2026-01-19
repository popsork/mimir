import { ArticleGroup, type ArticleGroupApiResponseResource } from "~/models/ArticleGroup";
import type { Project } from "~/models/Project";

export const useOrderFormArticleGroupsStore = defineStore("order-form-article-groups", () => {
    const model = ArticleGroup;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormArticleGroups;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const getArticleGroupsForProject = (project: Project | null) => {
        const query = repo.orderBy("sequenceNumber");

        // if a project has some articles or article groups assigned to it, the available groups should be limited.
        // in that case the groups dropdown should show groups from two sources:
        // 1) groups that are directly assigned to the project as whole groups
        // 2) groups that are indirectly assigned because an article from that group is assigned to the project

        // when loading the project, the articleGroupIds array gets populated using both sources,
        // so the array is enough for filtering here

        if (!project || project.articleGroupIds.length === 0) {
            // project not set or the project does not have any article group restrictions
            return query.get();
        }

        return query.whereIn("id", project.articleGroupIds).get();
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
        const apiResponse: { data: ArticleGroupApiResponseResource[] } = await useApi().getArticleGroups();

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    return {
        loadArticleGroupsIfNeeded: loadRecordsIfNeeded,
        getArticleGroupsForProject,
        waitingForArticleGroups: waitingForRecords,
    };
});

