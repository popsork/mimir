<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="actionText" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="dispatch-orders-form" v-on:submit.prevent="performAction")
        h3.order-heading {{ orderHeadingText }}
        template(v-if="actionType === ActionType.UndispatchTransportOrder")
            FormCheckboxField(
                v-model="shouldDispatchToADifferentUnit"
                name="dispatch-to-a-different-unit"
                :label="$t('orders.dispatch.actions.Dispatch to a different unit')"
            )
        template(v-else)
            OrdersDialogUnitField(
                ref="firstField"
                v-model:unit="unit"
                v-model:action-type="actionType"
                :label="unitLabel"
                :errors="unitErrors"
                dialog-mode="dispatch"
            )
        template(v-if="shouldShowPlanDispatchFields")
            OrdersDispatchFieldsTimeout
            OrdersDispatchFieldsImmediate
            OrdersDispatchFieldsDateAndTime(v-if="showDateAndTime")
        FormErrors(:errors="formErrors")
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="dispatch-orders-form"
            icon="arrow-outward"
            :disabled="!isCurrentActionAllowed"
            :waiting-for="WaitingFor.TransportOrderDispatching"
        ) {{ actionText }}
</template>
<script setup lang="ts">
import type { Unit } from "~/models/Unit";

// the dispatching dialog component is not used only for dispatching, but for some other actions as well, like planning

const { t } = useI18n();

const dispatchStore = useOrdersDispatchStore();
const {
    partialTransportOrders,
    form,
    actionType,
    isCurrentActionAllowed,
    shouldShowDialog
} = storeToRefs(dispatchStore);

const numberOfOrders = computed(() => {
    return partialTransportOrders.value.length;
});

const processingSingleTransportOrder = computed(() => {
    return numberOfOrders.value === 1;
});

const orderHeadingText = computed(() => {
    if (processingSingleTransportOrder.value) {
        const transportOrderNumber = partialTransportOrders.value[0]!.number;
        return t("orders.dispatch.headings.Transport order", { number: transportOrderNumber });
    }
    return t("orders.dispatch.headings.Transport orders", { number: numberOfOrders.value });
});


const unit = computed({
    get: () => form.value.unit as Unit | null,
    set: (unit: Unit | null) => {
        form.value.unit = unit;
    }
});
const unitLabel = t("orders.dispatch.fields.Unit");

const shouldShowPlanDispatchFields = computed(() => {
    return [
        ActionType.PlanDispatchTransportOrder,
        ActionType.DispatchTransportOrder
    ].includes(actionType.value);
});

const showDateAndTime = computed(() => actionType.value === ActionType.PlanDispatchTransportOrder);

const actionText = computed(() => {
    switch (actionType.value) {
        case ActionType.PlanTransportOrder:
            return t("orders.dispatch.actions.Plan");
        case ActionType.DispatchTransportOrder:
            return t("orders.dispatch.actions.Dispatch");
        case ActionType.PlanDispatchTransportOrder:
            return t("orders.dispatch.actions.Schedule dispatch");
        case ActionType.UndispatchTransportOrder:
            return t("orders.dispatch.actions.Undispatch");
        default:
            throw new Error(`Unknown action type ${actionType.value}`);
    }
});

const successText = computed(() => {
    switch (actionType.value) {
        case ActionType.DispatchTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.dispatch.messages.Transport order dispatched");
            }
            return t("orders.dispatch.messages.Transport orders dispatched");
        case ActionType.PlanDispatchTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.dispatch.messages.Transport order scheduled for dispatch");
            }
            return t("orders.dispatch.messages.Transport orders scheduled for dispatch");
        case ActionType.PlanTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.dispatch.messages.Transport order planned");
            }
            return t("orders.dispatch.messages.Transport orders planned");
        case ActionType.UndispatchTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.dispatch.messages.Transport order undispatched");
            }
            return t("orders.dispatch.messages.Transport orders undispatched");
        default:
            throw new Error(`Unknown action type ${actionType.value}`);
    }
});

const shouldDispatchToADifferentUnit = computed({
    get: () => false,
    set: (value: boolean) => {
        if (value) {
            dispatchStore.setActionType(ActionType.DispatchTransportOrder);
        }
    }
});


const firstField = useTemplateRef("firstField");

const focusFirstField = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};

const close = () => {
    dispatchStore.reset();
};

const { showMessage } = useFloatingMessage();

const performAction = async () => {
    const successMessageText = successText.value;
    const actionOk = await dispatchStore.performAction();

    if (actionOk) {
        showMessage({
            type: FloatingMessageType.Success,
            text: successMessageText
        });
        close();
    }
};

const formErrors = computed(() => {
    return form.value.errors.exceptForFields(["context", "rollback_interval", "execute_at"]);
});

const unitErrors = computed(() => form.value.errors.forField("context"));

</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;

    .order-heading {
        @include small-heading;
        margin-bottom: steps(1);
    }

    .field {
        margin-bottom: steps(2);
    }
}
</style>
