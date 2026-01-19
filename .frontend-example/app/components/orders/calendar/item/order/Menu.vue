<template lang="pug">
.order-menu(v-if="calendarTransportOrder")
    PopoverMenuButton(
        v-if="customerOrderId"
        :to="getOrderRoute(customerOrderId)"
        :text="$t('orders.calendar.actions.Edit order')"
        :highlight="true"
        v-on:click="close"
    )
    PopoverMenuButton(
        :text="$t('orders.calendar.actions.View details')"
        :highlight="true"
        v-on:click="handleViewDetails"
    )
    PopoverMenuButton(
        v-if="isDispatchingActionAllowed(ActionType.PlanTransportOrder)"
        :text="$t('orders.dispatch.actions.Plan')"
        :highlight="true"
        v-on:click="initializeActionDialog(ActionType.PlanTransportOrder)"
    )
    PopoverMenuButton(
        v-if="isDispatchingActionAllowed(ActionType.DispatchTransportOrder)"
        :text="$t('orders.dispatch.actions.Dispatch')"
        :highlight="true"
        v-on:click="initializeActionDialog(ActionType.DispatchTransportOrder)"
    )
    PopoverMenuButton(
        v-if="isDispatchingActionAllowed(ActionType.UndispatchTransportOrder)"
        :text="$t('orders.dispatch.actions.Undispatch')"
        :highlight="true"
        v-on:click="initializeActionDialog(ActionType.UndispatchTransportOrder)"
    )
</template>
<script setup lang="ts">

const props = defineProps<{
    orderId: string | null,
}>();

const transportOrderId = computed(() => props.orderId);

const ordersStore = useOrdersCalendarOrdersStore();

const calendarTransportOrder = computed(() => {
    if (!transportOrderId.value) {
        return null;
    }

    return ordersStore.getRecordById(transportOrderId.value);
});

const customerOrderId = computed(() => calendarTransportOrder.value?.orderId ?? null);

const dispatchStore = useOrdersDispatchStore();

const isDispatchingActionAllowed = (actionType: DispatchingDialogActionType) => {
    if (!calendarTransportOrder.value) {
        return false;
    }
    return dispatchStore.isActionAllowedForTransportOrderStatuses({
        actionType,
        statuses: [calendarTransportOrder.value.status]
    });
};

const initializeActionDialog = (actionType: DispatchingDialogActionType) => {
    if (!calendarTransportOrder.value) {
        return;
    }
    dispatchStore.initializeActionDialog({
        type: actionType,
        transportOrderObjects: [{
            id: calendarTransportOrder.value.id,
            number: calendarTransportOrder.value.number,
            status: calendarTransportOrder.value.status,
        }]
    });
};

const calendarStore = useOrdersCalendarStore();
const detailsSidebarStore = useOrdersDetailsSidebarStore();
const calendarSidebarStore = useOrdersCalendarSidebarStore();

const close = () => {
    calendarStore.deactivateMenu();
};

const handleViewDetails = () => {
    if (!transportOrderId.value) {
        return;
    }
    detailsSidebarStore.selectedOrderRowId = transportOrderId.value;
    calendarSidebarStore.openSidebar(ViewTool.Details);
    close();
};


</script>
<style scoped lang="scss"></style>
