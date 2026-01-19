import { ActionExecution } from "~/models/ActionExecution";
import { TransportOrder } from "~/models/TransportOrder";


const menuActionTypes = [
    ActionType.AcceptTransportOrder,
] as Partial<ActionType>[];

export type MenuActionType = typeof menuActionTypes[number];

export const useOrdersListMenuActionsStore = defineStore("orders-list-menu-actions", () => {

    const actionsStore = useOrderActionStore();
    const { actionsByType } = storeToRefs(actionsStore);

    const performAction = async (transportOrderId: OrderRow["id"], waitParams: WaiterParams, optionType: MenuActionType): Promise<void> => {
        const actionExecution = buildActionExecution(optionType, transportOrderId);
        if (!actionExecution) {
            return;
        }
        await createActionExecution(actionExecution, waitParams);
    };

    const buildActionExecution = (optionType: MenuActionType, id: string) => {
        if (!menuActionTypes.includes(optionType)) {
            return;
        }

        if (!(actionsByType.value[optionType])) {
            return;
        }

        const actionExecution = ActionExecution.buildBlank();

        actionExecution.action = actionsByType.value[optionType];
        actionExecution.actionId = actionsByType.value[optionType]?.id ?? null;
        actionExecution.setActionableRecord(new TransportOrder({ id }));

        return actionExecution;
    };

    const waitStore = useWaitStore();

    const createActionExecution = wrapFunctionInApiErrorHandler(async (actionExecution: ActionExecution, waitParams: WaiterParams): Promise<void> => {
        try {
            waitStore.start(WaitingFor.OrderListAction, waitParams);
            await useApi().createActionExecution(actionExecution);
        } finally {
            waitStore.end(WaitingFor.OrderListAction, waitParams);
        }
    });

    return {
        performAction
    };
});
