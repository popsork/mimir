import { Activity, type ActivityApiResponseResource } from "~/models/Activity";
import type { Project } from "~/models/Project";

export const useOrderFormActivitiesStore = defineStore("order-form-activities", () => {
    const model = Activity;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormActivities;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const records = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const getActivitiesForProject = (project: Project | null) => {
        const activities = records.value.filter(activity => activity.visible);

        if (!project || (project.activityGroupIds.length === 0 && project.activityIds.length === 0)) {
            // project not set or the project does not have any activity restrictions
            return activities;
        }

        // pinia-orm's orWhereIn chaining does not seem to work correctly,
        // so just filter the records after fetching from repo
        return activities.filter((activity) => {
            if (activity.groupId && project.activityGroupIds.includes(activity.groupId)) {
                return true;
            }
            if (project.activityIds.includes(activity.id)) {
                return true;
            }
            return false;
        });
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
        const apiResponse: { data: ActivityApiResponseResource[] } = await useApi().getActivities();

        const records = apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });

        return records;
    });

    return {
        loadActivitiesIfNeeded: loadRecordsIfNeeded,
        getActivitiesForProject,
        waitingForActivities: waitingForRecords,
    };
});

