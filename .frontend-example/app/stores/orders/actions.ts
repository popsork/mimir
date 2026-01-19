import { Action, type ActionApiResponseResource } from "~/models/Action";

export const useOrderActionStore = defineStore("orders-actions", () => {
    const model = Action;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderActions;

    const waitStore = useWaitStore();

    const actions = computed(() => {
        return repo.orderBy("key").get();
    });

    const loadActions = async () => {
        try {
            waitStore.start(waiterName);
            const records = await fetchActions();
            repo.flush();
            repo.insert(records);
        } finally {
            waitStore.end(waiterName);
        }
    };

    const loadActionsIfNeeded = () => {
        if (actions.value.length || waitStore.is(waiterName)) {
            return;
        }
        loadActions();
    };

    const fetchActions = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();

        const apiResponse: { data: ActionApiResponseResource[] } = await apiClient.getActions();

        return apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });
    });

    const actionsByType = computed(() => {
        const result: Partial<Record<ActionType, Action | undefined>> = {};

        const types = [
            ActionType.DispatchTransportOrder,
            ActionType.PlanDispatchTransportOrder,
            ActionType.PlanTransportOrder,
            ActionType.UndispatchTransportOrder,
            ActionType.AcceptTransportOrder,
            ActionType.CompleteTransportOrder,
            ActionType.CompleteAndVerifyTransportOrder,
            ActionType.VerifyTransportOrder,
        ] as ActionType[];

        types.forEach((type) => {
            result[type] = actions.value.find(action => action.key === type);
        });

        return result;
    });


    return {
        actions,
        loadActionsIfNeeded,
        actionsByType
    };

});
