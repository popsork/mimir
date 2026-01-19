import type { Unit } from "~/models/Unit";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import {
    ActionExecution,
    type CompleteAndVerifyTransportOrderActionExecutionContext,
    type CompleteTransportOrderActionExecutionContext,
} from "~/models/ActionExecution";
import { TransportOrder, type TransportOrderApiResponseResource } from "~/models/TransportOrder";

// the completion store is also used for verifying
const completionDialogActionTypes = [
    ActionType.CompleteTransportOrder,
    ActionType.VerifyTransportOrder,
    ActionType.CompleteAndVerifyTransportOrder,
] as const;

export type CompletionDialogActionType = typeof completionDialogActionTypes[number];

export type CompletionDialogTransportOrder = {
    id: TransportOrder["id"],
    number: TransportOrder["number"],
    status: TransportOrderStatusName,
};

export const useOrdersCompleteStore = defineStore("orders-complete", () => {
    const getDefaultValues = () => {
        return {
            partialTransportOrders: [] as CompletionDialogTransportOrder[],
            actionType: ActionType.CompleteTransportOrder as CompletionDialogActionType,
            shouldShowDialog: false,
            dialogSuccessCallback: null as (() => void) | null,
            form: {
                unit: null as Unit | null,
                completedAtDateTime: null as string | null,
                errors: new JsonApiErrorCollection(),
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

    const setActionType = (type: CompletionDialogActionType) => {
        actionType.value = type;
    };

    const isActionAllowedForTransportOrderStatuses = (
        { actionType, statuses }: { actionType: CompletionDialogActionType, statuses: TransportOrderStatusName[] }
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
            type: CompletionDialogActionType,
            transportOrderObjects: CompletionDialogTransportOrder[],
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

        const completing = [
            ActionType.CompleteTransportOrder,
            ActionType.CompleteAndVerifyTransportOrder,
        ].includes(actionType.value);

        if (completing) {
            // fetch some values for the dialog from the first transport order
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
        // setting values from API response, which might have new updates

        // Pre-fill the unit if it's already assigned to the Transport-order
        form.value.unit = transportOrder.unit;
        form.value.completedAtDateTime = getUtcDatetimeString(new Date());
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

    const buildActionExecution = (transportOrderObject: CompletionDialogTransportOrder) => {
        if (!completionDialogActionTypes.includes(actionType.value)) {
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

        return actionExecution;
    };

    const buildActionExecutionContext = () => {
        if (actionType.value === ActionType.VerifyTransportOrder) {
            // verification has no context
            return null;
        }

        const targetUnitId = form.value.unit?.id ?? null;

        const completeContext: CompleteTransportOrderActionExecutionContext = {
            unit_id: targetUnitId,
            status: TransportOrderStatusName.Completed,
            created_at: getSystemTimeZoneDatetimeString(form.value.completedAtDateTime)
        };

        if (actionType.value === ActionType.CompleteTransportOrder) {
            return completeContext;
        }

        // complete and verify needs additional context for the creation of the verification action execution
        const completeAndVerifyContext: CompleteAndVerifyTransportOrderActionExecutionContext = {
            ...completeContext,
            create_action_execution_context: {
                status: TransportOrderStatusName.Verified,
            }
        };

        return completeAndVerifyContext;
    };

    const createActionExecutions = wrapFunctionInApiErrorHandler(async (actionExecutions: ActionExecution[]) => {
        try {
            waitStore.start(WaitingFor.TransportOrderCompleting);
            const operations = useActionExecutionSavingOperations(actionExecutions);
            await useApi().saveActionExecutions({ operations });
            clearFormErrors();
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
            waitStore.end(WaitingFor.TransportOrderCompleting);
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
