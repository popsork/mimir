<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="actionText" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="complete-orders-form" v-on:submit.prevent="performAction")
        h3.order-heading {{ orderHeadingText }}
        template(v-if="actionType !== ActionType.VerifyTransportOrder")
            OrdersDialogUnitField(
                ref="firstField"
                v-model:unit="unit"
                v-model:action-type="actionType"
                :label="unitLabel"
                :errors="unitErrors"
                dialog-mode="complete"
            )
            OrdersCompleteFieldsDateAndTime
            OrdersCompleteFieldsReadyForInvoicing(v-if="isCompleteAndVerifyActionAllowed")
        FormErrors(:errors="formErrors")
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="complete-orders-form"
            icon="ticked-circle"
            :disabled="!isCurrentActionAllowed"
            :waiting-for="WaitingFor.TransportOrderCompleting"
        ) {{ actionText }}
</template>
<script setup lang="ts">
import type { Unit } from "~/models/Unit";

// the completion dialog component is not used only for completing, but also for verifying
const { t } = useI18n();

const completeStore = useOrdersCompleteStore();
const {
    partialTransportOrders,
    form,
    actionType,
    isCurrentActionAllowed,
    shouldShowDialog,
} = storeToRefs(completeStore);

const numberOfOrders = computed(() => {
    return partialTransportOrders.value.length;
});

const processingSingleTransportOrder = computed(() => {
    return numberOfOrders.value === 1;
});

const orderHeadingText = computed(() => {
    if (processingSingleTransportOrder.value) {
        const transportOrderNumber = partialTransportOrders.value[0]!.number;
        return t("orders.complete.headings.Transport order", { number: transportOrderNumber });
    }
    return t("orders.complete.headings.Transport orders", { number: numberOfOrders.value });
});

const isCompleteAndVerifyActionAllowed = computed(() => {
    const statuses = partialTransportOrders.value.map((order) => order.status);

    return completeStore.isActionAllowedForTransportOrderStatuses({
        actionType: ActionType.CompleteAndVerifyTransportOrder,
        statuses
    });
});

const unit = computed({
    get: () => form.value.unit as Unit | null,
    set: (unit: Unit | null) => {
        form.value.unit = unit;
    }
});

const unitLabel = t("orders.complete.fields.Unit");

const actionText = computed(() => {
    switch (actionType.value) {
        case ActionType.CompleteTransportOrder:
            return t("orders.complete.actions.Complete");
        case ActionType.CompleteAndVerifyTransportOrder:
            return t("orders.complete.actions.Complete and verify");
        case ActionType.VerifyTransportOrder:
            return t("orders.complete.actions.Verify");
        default:
            throw new Error(`Unknown action type ${actionType.value}`);
    }
});

const successText = computed(() => {
    switch (actionType.value) {
        case ActionType.CompleteTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.complete.messages.Transport order completed");
            }
            return t("orders.complete.messages.Transport orders completed");
        case ActionType.CompleteAndVerifyTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.complete.messages.Transport order completed and verified");
            }
            return t("orders.complete.messages.Transport orders completed and verified");
        case ActionType.VerifyTransportOrder:
            if (processingSingleTransportOrder.value) {
                return t("orders.complete.messages.Transport order verified");
            }
            return t("orders.complete.messages.Transport orders verified");
        default:
            throw new Error(`Unknown action type ${actionType.value}`);
    }
});

const firstField = useTemplateRef("firstField");
const focusFirstField = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};

const close = () => {
    completeStore.reset();
};

const { showMessage } = useFloatingMessage();
const performAction = async () => {
    const successMessageText = successText.value;
    const actionOk = await completeStore.performAction();

    if (actionOk) {
        showMessage({
            type: FloatingMessageType.Success,
            text: successMessageText
        });
        close();
    }
};

const formErrors = computed(() => {
    return form.value.errors.exceptForFields(["context", "completed_at"]);
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
