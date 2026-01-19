<template lang="pug">
.actions
    .secondary
        GenericButton(
            v-if="customerOrderId"
            type="secondary"
            :to="getOrderRoute(customerOrderId)"
        ) {{ $t("orders.sidebar.actions.Edit order") }}
        GenericButton(
            type="secondary"
            icon="calendar-inward"
            :disabled="!isDispatchingActionAllowed(ActionType.PlanTransportOrder)"
            v-on:click="initializeActionDialog(ActionType.PlanTransportOrder)"
        ) {{ $t("orders.sidebar.actions.Plan") }}
    .primary
        GenericButton(
            type="primary"
            icon="arrow-outward"
            :waiting-for="WaitingFor.TransportOrderLoading"
            :disabled="!isDispatchOrPlanDispatchActionsAllowed"
            v-on:click="initializeActionDialog(ActionType.DispatchTransportOrder)"
        ) {{ $t("orders.sidebar.actions.Dispatch") }}
</template>
<script setup lang="ts">
const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { orderRow } = storeToRefs(detailsSidebarStore);

const customerOrderId = computed(() => orderRow.value?.order_id || null);

const dispatchStore = useOrdersDispatchStore();

const isDispatchingActionAllowed = (actionType: DispatchingDialogActionType) => {
    if (!orderRow.value) {
        return false;
    }
    return dispatchStore.isActionAllowedForTransportOrderStatuses({
        actionType,
        statuses: [orderRow.value.status]
    });
};

const isDispatchOrPlanDispatchActionsAllowed = computed(() => {
    return isDispatchingActionAllowed(ActionType.DispatchTransportOrder) || !isDispatchingActionAllowed(ActionType.PlanDispatchTransportOrder);
});

const initializeActionDialog = (actionType: DispatchingDialogActionType) => {
    if (!orderRow.value) {
        return;
    }
    dispatchStore.initializeActionDialog({
        type: actionType,
        transportOrderObjects: [{
            id: orderRow.value.id,
            number: orderRow.value.number,
            status: orderRow.value.status,
        }],
    });
};

</script>
<style scoped lang="scss">
.actions {
    padding-top: steps(2);
    padding-bottom: steps(3);
    background-color: transparent;
    border-top: 1px solid $color-border-light;
    display: flex;
    flex-direction: column;
    gap: steps(1.5);

    .primary,
    .secondary {
        display: flex;
        gap: steps(1);
        justify-content: center;

        .button {
            flex: 1;
        }
    }

}
</style>
