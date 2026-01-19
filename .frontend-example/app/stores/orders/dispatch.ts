import type { Unit } from "~/models/Unit";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import {
    ActionExecution,
    type TransportOrderActionExecutionContext,
    type ScheduleDispatchTransportOrderActionExecutionContext
} from "~/models/ActionExecution";
import { TransportOrder, type TransportOrderApiResponseResource } from "~/models/TransportOrder";

// the dispatching store is not used only for dispatching, but for some other actions as well, like planning
const dispatchingDialogActionTypes = [
    ActionType.PlanTransportOrder,
    ActionType.DispatchTransportOrder,
    ActionType.PlanDispatchTransportOrder,
    ActionType.UndispatchTransportOrder,
] as const;

export type DispatchingDialogActionType = typeof dispatchingDialogActionTypes[number];

export type DispatchingDialogTransportOrder = {
    id: TransportOrder["id"],
    number: TransportOrder["number"],
    status: TransportOrderStatusName,
};

export const useOrdersDispatchStore = defineStore("orders-dispatch", () => {
    const getDefaultValues = () => {
        return {
            partialTransportOrders: [] as DispatchingDialogTransportOrder[],
            actionType: ActionType.PlanTransportOrder as DispatchingDialogActionType,
            shouldShowDialog: false,
            dialogSuccessCallback: null as (() => void) | null,
            form: {
                unit: null as Unit | null,
                timeoutInMinutes: 30 as number | null,
                dispatchDateTime: null as string | null,
                errors: new JsonApiErrorCollection()
            }
        };
    };

    const defaults = getDefaultValues();
    const partialTransportOrders = ref(defaults.partialTransportOrders);
    const actionType = ref(defaults.actionType);
    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const dialogSuccessCallback = shallowRef(defaults.dialogSuccessCallback);
    const form = ref(defaults.form);

    const transportOrderStatuses = computed(() => {
        return partialTransportOrders.value.map(partial => partial.status);
    });

    const setActionType = (type: DispatchingDialogActionType) => {
        actionType.value = type;
    };

    const isActionAllowedForTransportOrderStatuses = (
        { actionType, statuses }: { actionType: DispatchingDialogActionType, statuses: TransportOrderStatusName[] }
    ) => {
        if (statuses.length === 0) {
            return false;
        }
        return statuses.every(status => isActionAllowedForTransportOrderStatus({ actionType, status }));
    };

    const isCurrentActionAllowed = computed(() => {
        return isActionAllowedForTransportOrderStatuses({
            actionType: actionType.value,
            statuses: transportOrderStatuses.value
        });
    });

    const initializeActionDialog = async (
        { type, transportOrderObjects, onSuccess }:
        {
            type: DispatchingDialogActionType,
            transportOrderObjects: DispatchingDialogTransportOrder[],
            onSuccess?: () => void,
        }
    ) => {
        clearForm();
        if (transportOrderObjects.length === 0) {
            return;
        }
        setActionType(type);
        partialTransportOrders.value = transportOrderObjects;
        dialogSuccessCallback.value = onSuccess ?? null;

        const dispatchingOrUndispatching = [
            ActionType.DispatchTransportOrder,
            ActionType.PlanDispatchTransportOrder,
            ActionType.UndispatchTransportOrder
        ].includes(actionType.value);

        if (dispatchingOrUndispatching) {
            // some dispatching settings need to be calculated from the transport order values,
            // so we need to fetch the record from the API before displaying the dialog.
            // since undispatching can be switched to dispatching to a different unit in the dialog,
            // we also need to fetch the record in case of undispatching.
            // in case of multiple transport orders, use the first one.
            const firstId = transportOrderObjects[0]!.id;
            const firstTransportOrder = await fetchTransportOrder(firstId);
            if (!firstTransportOrder) {
                // transport order is not found, should not normally happen,
                // a technical error should have been shown by now on API request failure, do not open the dialog
                return;
            }

            updateFormValuesFromTransportOrder(firstTransportOrder);
        }

        shouldShowDialog.value = true;
    };

    const waitStore = useWaitStore();

    const fetchTransportOrder = wrapFunctionInApiErrorHandler(async (transportOrderId: string): Promise<TransportOrder | undefined> => {
        try {
            waitStore.start(WaitingFor.TransportOrderLoading);
            const apiResponse: {
                data: TransportOrderApiResponseResource,
            } = await useApi().getTransportOrder(transportOrderId);

            return TransportOrder.fromApiResponse(apiResponse.data);
        } finally {
            waitStore.end(WaitingFor.TransportOrderLoading);
        }
    });

    const waitingForDialogInitialization = computed(() => {
        return waitStore.is(WaitingFor.TransportOrderLoading);
    });

    const updateFormValuesFromTransportOrder = (transportOrder: TransportOrder) => {
        const defaults = getDefaultValues();

        // setting values from API response, which might have new updates
        form.value.timeoutInMinutes = transportOrder.operation?.acceptanceTimeMinutes ?? defaults.form.timeoutInMinutes;
        // In the "Plan Transport-order Dispatch" Dialog, TP should manually enter the dispatch_at time
        // Otherwise TP's intention is only to "Plan" the Transport-order dispatching.
        // (ASAP when the unit becomes active, it should dispatch Transport-order regardless of time)
        form.value.dispatchDateTime = getUtcDatetimeString(new Date());
        // Pre-fill the unit if it's already assigned to the Transport-order
        form.value.unit = transportOrder.unit;
        if (transportOrder.unit && !(transportOrder.unit.isActive)) {
            // If a Transport-order has an assigned but inactive unit, automatically switch the action to “Plan Transport-order Dispatch” so the TP can pick a future time.
            // This avoids an immediate dispatch failure and reduces UX confusion.
            actionType.value = ActionType.PlanDispatchTransportOrder;
        }

        return true;
    };


    const actionsStore = useOrderActionStore();
    const { actionsByType } = storeToRefs(actionsStore);

    const performAction = async () => {
        const actionExecutions = buildActionExecutions();
        if (!actionExecutions || actionExecutions.length === 0) {
            return false;
        }
        const result = await createActionExecutions(actionExecutions);
        if (result && dialogSuccessCallback.value) {
            dialogSuccessCallback.value();
        }
        return result;
    };

    const buildActionExecutions = () => {
        const executions: ActionExecution[] = [];
        for (const transportOrderObject of partialTransportOrders.value) {
            const actionExecution = buildActionExecution(transportOrderObject);
            if (!actionExecution) {
                // if any of the executions fails to constrct, the whole function should return null
                return null;
            }
            executions.push(actionExecution);
        }
        return executions;
    };

    const buildActionExecution = (transportOrderObject: DispatchingDialogTransportOrder) => {
        if (!dispatchingDialogActionTypes.includes(actionType.value)) {
            return;
        }

        const action = actionsByType.value[actionType.value];
        if (!action) {
            return;
        }

        const actionExecution = ActionExecution.buildBlank();
        actionExecution.actionId = action.id;
        actionExecution.action = action;
        // setting the actionable record is a bit more complex due to polymorphism,
        // so it has a separate setter in the model
        actionExecution.setActionableRecord(new TransportOrder({ id: transportOrderObject.id }));

        actionExecution.context = buildActionExecutionContext();

        if (actionType.value === ActionType.DispatchTransportOrder) {
            actionExecution.setRollbackIntervalInMinutes(form.value.timeoutInMinutes);
        }

        return actionExecution;
    };

    const buildActionExecutionContext = () => {
        if (actionType.value === ActionType.UndispatchTransportOrder) {
            return null;
        }

        const targetUnitId = form.value.unit?.id ?? null;

        const basicContext: TransportOrderActionExecutionContext = {
            unit_id: targetUnitId,
            status: getImmediateTargetStatusByActionType(actionType.value),
        };

        if (actionType.value !== ActionType.PlanDispatchTransportOrder) {
            return basicContext;
        }

        // scheduled dispatch (plan dispatch) context is more complicated
        const scheduledDispatchContext: ScheduleDispatchTransportOrderActionExecutionContext = {
            ...basicContext,
            create_action_execution_context: {
                unit_id: targetUnitId,
                status: TransportOrderStatusName.Dispatched,
                execute_at: getSystemTimeZoneDatetimeString(form.value.dispatchDateTime),
                rollback_interval: form.value.timeoutInMinutes ? `${form.value.timeoutInMinutes}M` : null,
            }
        };
        return scheduledDispatchContext;
    };

    const getImmediateTargetStatusByActionType = (
        type: Exclude<DispatchingDialogActionType, typeof ActionType.UndispatchTransportOrder>
    ) => {
        switch (type) {
            case ActionType.PlanTransportOrder:
            case ActionType.PlanDispatchTransportOrder:
                return TransportOrderStatusName.Planned;
            case ActionType.DispatchTransportOrder:
                return TransportOrderStatusName.Dispatched;
            default:
                throw new Error(`Unsupported action type for immediate target status: ${type}`);
        }
    };

    const calendarOrdersStore = useOrdersCalendarOrdersStore();

    const createActionExecutions = wrapFunctionInApiErrorHandler(async (actionExecutions: ActionExecution[]) => {
        try {
            waitStore.start(WaitingFor.TransportOrderDispatching);
            const operations = useActionExecutionSavingOperations(actionExecutions);
            await useApi().saveActionExecutions({ operations });
            clearFormErrors();
            actionExecutions.forEach(actionExecution => {
                // notify calendar store about any changes to allow immediate UI update before websocket updates arrive
                if (!actionExecution.context) {
                    return;
                }
                const newUnitId = actionExecution.context.unit_id;
                const newStatus = actionExecution.context.status;
                calendarOrdersStore.updateStatusAndUnitId({
                    orderId: actionExecution.actionableRecordId!,
                    unitId: newUnitId,
                    status: newStatus
                });
            });

            return true;
        } catch (error) {
            const validationErrors = extractDisplayableJsonApiErrors({ error });
            if (validationErrors) {
                form.value.errors = validationErrors;
            } else {
                clearFormErrors();
                throw error;
            }
        } finally {
            waitStore.end(WaitingFor.TransportOrderDispatching);
        }
    });


    const clearFormErrors = () => {
        form.value.errors = new JsonApiErrorCollection();
    };

    const clearForm = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
    };

    const reset = () => {
        clearForm();
        const defaults = getDefaultValues();
        actionType.value = defaults.actionType;
        partialTransportOrders.value = defaults.partialTransportOrders;
        shouldShowDialog.value = defaults.shouldShowDialog;
        dialogSuccessCallback.value = defaults.dialogSuccessCallback;
    };

    return {
        partialTransportOrders,

        setActionType,
        actionType,
        form,
        shouldShowDialog,
        isActionAllowedForTransportOrderStatuses,
        isCurrentActionAllowed,

        initializeActionDialog,
        waitingForDialogInitialization,
        performAction,
        reset,
    };
});
