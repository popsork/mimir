<template lang="pug">
FloatingDock(v-if="shouldShowFloatingDock" :bounding-element="boundingElement")
    template(v-slot:actions)
        GenericButton(
            icon="calendar-inward"
            :disabled="!isPlanActionAllowed"
            v-on:click="initializeDispatchActionDialog(ActionType.PlanTransportOrder)"
        ) {{ $t("orders.dispatch.actions.Plan") }}
        GenericButton(
            icon="arrow-outward"
            :waiting="initializingDispatchActionDialog"
            :disabled="!isDispatchOrPlanDispatchActionAllowed"
            v-on:click="initializeDispatchActionDialog(ActionType.DispatchTransportOrder)"
        )  {{ $t("orders.dispatch.actions.Dispatch") }}
        GenericButton(
            icon="ticked-circle"
            :waiting="initializingCompleteDialog"
            :disabled="!isCompleteActionAllowed"
            v-on:click="initializeCompleteActionDialog(ActionType.CompleteTransportOrder)"
        )  {{ $t("orders.complete.actions.Complete") }}
        GenericButton(
            icon="ticked-circle"
            :waiting="initializingVerifyDialog"
            :disabled="!isVerifyActionAllowed"
            v-on:click="initializeCompleteActionDialog(ActionType.VerifyTransportOrder)"
        )  {{ $t("orders.complete.actions.Verify") }}
    template(v-slot:message)
        p {{ $t("orders.list.messages.N orders selected", { number: selectedRows.length }) }}
</template>
<script setup lang="ts">
defineProps<{
    boundingElement?: HTMLElement | null,
}>();

const clickedAction = ref(null as DispatchingDialogActionType | CompletionDialogActionType | null);

const tableStore = useOrdersListTableStore();
const { selectedRows } = storeToRefs(tableStore);

const shouldShowFloatingDock = computed(() => {
    return selectedRows.value.length > 0;
});

const selectedRowStatuses = computed((): TransportOrderStatusName[] => {
    return selectedRows.value.map((row: OrderRow) => row.status);
});


const dispatchStore = useOrdersDispatchStore();
const { waitingForDialogInitialization: waitingForDispatchDialogInitialization } = storeToRefs(dispatchStore);

const isDispatchingActionAllowed = (actionType: DispatchingDialogActionType) => {
    return dispatchStore.isActionAllowedForTransportOrderStatuses({
        actionType,
        statuses: selectedRowStatuses.value
    });
};

const isPlanActionAllowed = computed(() => {
    return isDispatchingActionAllowed(ActionType.PlanTransportOrder);
});

const isDispatchOrPlanDispatchActionAllowed = computed(() => {
    return isDispatchingActionAllowed(ActionType.DispatchTransportOrder) || isDispatchingActionAllowed(ActionType.PlanDispatchTransportOrder);
});

const initializeDispatchActionDialog = (actionType: DispatchingDialogActionType) => {
    clickedAction.value = actionType;
    dispatchStore.initializeActionDialog({
        type: actionType,
        transportOrderObjects: selectedRows.value.map((row: OrderRow): DispatchingDialogTransportOrder => ({
            id: row.id,
            number: row.number,
            status: row.status,
        })),
        onSuccess: () => {
            tableStore.deselectAllRows();
        }
    });
};

watch(waitingForDispatchDialogInitialization, (waiting) => {
    if (!waiting) {
        clickedAction.value = null;
    }
});

const initializingDispatchActionDialog = computed(() => {
    return clickedAction.value === ActionType.DispatchTransportOrder && waitingForDispatchDialogInitialization.value;
});

const completeStore = useOrdersCompleteStore();
const { waitingForDialogInitialization: waitingForCompleteDialogInitialization } = storeToRefs(completeStore);

const isCompletionActionAllowed = (actionType: CompletionDialogActionType) => {
    return completeStore.isActionAllowedForTransportOrderStatuses({
        actionType,
        statuses: selectedRowStatuses.value
    });
};

const isVerifyActionAllowed = computed(() => {
    return isCompletionActionAllowed(ActionType.VerifyTransportOrder);
});

const isCompleteActionAllowed = computed(() => {
    return isCompletionActionAllowed(ActionType.CompleteTransportOrder);
});


const initializeCompleteActionDialog = (actionType: CompletionDialogActionType) => {
    clickedAction.value = actionType;
    completeStore.initializeActionDialog({
        type: actionType,
        transportOrderObjects: selectedRows.value.map((row: OrderRow): CompletionDialogTransportOrder => ({
            id: row.id,
            number: row.number,
            status: row.status,
        })),
        onSuccess: () => {
            tableStore.deselectAllRows();
        }
    });
};

watch(waitingForCompleteDialogInitialization, (waiting) => {
    if (!waiting) {
        clickedAction.value = null;
    }
});

const initializingCompleteDialog = computed(() => {
    return clickedAction.value === ActionType.CompleteTransportOrder && waitingForCompleteDialogInitialization.value;
});

const initializingVerifyDialog = computed(() => {
    return clickedAction.value === ActionType.VerifyTransportOrder && waitingForCompleteDialogInitialization.value;
});


</script>
<style scoped lang="scss">
.button {
    width: steps(15);
}
</style>
