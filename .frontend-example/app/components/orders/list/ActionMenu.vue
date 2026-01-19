<template lang="pug">
PopoverMenu(ref="menu" trigger="click" placement="left")
    template(v-slot:trigger)
        GenericButton(
            class="trigger"
            icon="vertical-dots"
            type="alternative-ghost"
            size="small"
            :title="$t('orders.list.action_menu.Open order action menu')"
        )
    PopoverMenuButton(
        v-if="isAcceptActionAllowed"
        :text="$t('orders.list.action_menu.Accept order')"
        :waiting="isProcessingAccepting"
        v-on:click="handleAction(ActionType.AcceptTransportOrder)"
    )
    PopoverMenuButton(
        :text="$t('orders.list.action_menu.Show waybill')"
        :waiting="isProcessingShowWaybill"
        v-on:click="handleShowWaybill"
    )
    PopoverMenuButton(
        :text="$t('orders.list.action_menu.Deviation')"
        :waiting="isProcessingDeviation"
        v-on:click="handleDeviation"
    )
    PopoverMenuButton(
        :text="$t('orders.list.action_menu.Insert stop')"
        :waiting="isProcessingInsertStop"
        v-on:click="handleInsertStop"
    )
    PopoverMenuButton(
        v-if="props.row.order_id"
        :text="$t('orders.list.action_menu.Edit order')"
        :to="getOrderRoute(props.row.order_id)"
        v-on:click="hideActionMenu"
    )
</template>
<script setup lang="ts">
import type { MenuActionType } from "~/stores/orders/list/menuActions";

const waitStore = useWaitStore();

const props = defineProps<{
    row: OrderRow,
}>();

const menu = useTemplateRef("menu");

const menuActionsStore = useOrdersListMenuActionsStore();
const waitParamsFor = (action: string) => {
    return { id: props.row.id, action };
};

const isProcessingShowWaybill = computed(() => waitStore.is(WaitingFor.OrderListAction, waitParamsFor("show-waybill")));
const isProcessingDeviation = computed(() => waitStore.is(WaitingFor.OrderListAction, waitParamsFor("deviation")));
const isProcessingInsertStop = computed(() => waitStore.is(WaitingFor.OrderListAction, waitParamsFor("insert-stop")));
const isProcessingAccepting = computed(() => waitStore.is(WaitingFor.OrderListAction, waitParamsFor(ActionType.AcceptTransportOrder)));

const temporaryWaiting = (action: string) => {
    waitStore.start(WaitingFor.OrderListAction, waitParamsFor(action));
    setTimeout(() => {
        waitStore.end(WaitingFor.OrderListAction, waitParamsFor(action));
        menu.value?.hide();
    }, 500);
};

const handleAction = (menuActionType: MenuActionType) => {
    menuActionsStore
        .performAction(props.row.id, waitParamsFor(menuActionType), menuActionType)
        .finally(() => hideActionMenu());
};

const handleShowWaybill = () => {
    temporaryWaiting("show-waybill");
};

const handleDeviation = () => {
    temporaryWaiting("deviation");
};

const handleInsertStop = () => {
    temporaryWaiting("insert-stop");
};

const hideActionMenu = () => {
    menu.value?.hide();
};

const isAcceptActionAllowed = computed(() => {
    if (!props.row?.status) {
        return false;
    }

    return isActionAllowedForTransportOrderStatus({
        actionType: ActionType.AcceptTransportOrder,
        status: props.row.status
    });
});

</script>
<style scoped lang="scss">
.trigger {
    margin: -3px 0;
}
</style>
