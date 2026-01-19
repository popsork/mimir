<template lang="pug">
ConfirmationDialog(
    v-model:show="shouldShowDialog"
    :title="dialogTitle"
    :message="messageText"
    :waiting-for="WaitingFor.OrderDeleting"
    v-on:confirm="deleteOrder"
)
    template(v-slot:additional-content)
        ul.additional-content(v-if="!orderIsTemplate")
            template(v-for="(transportOrder) in transportOrders")
                li(v-if="transportOrder.number" :key="transportOrder.id")  {{ transportOrder.number }}
        FormErrors(:errors="errors")
</template>
<script setup lang="ts">
const { t } = useI18n();

const { order, orderIsTemplate } = storeToRefs(useOrderFormStore());

const transportOrders = computed(() => {
    return order.value.transportOrders || [];
});

const dialogTitle = computed(() => {
    return orderIsTemplate.value ? t("order.delete.headings.Delete template") : t("order.delete.headings.Delete order");
});

const messageText = computed(() => {
    // when deleting a template, we should not show associated transport orders, because they are not "real"
    if (orderIsTemplate.value) {
        return t("order.delete.messages.You are about to delete an order template");
    }
    return t("order.delete.messages.Along with this order, you are about to delete the following associated transport orders");
});

const orderDeleteStore = useOrderDeleteStore();
const { shouldShowDialog, errors } = storeToRefs(orderDeleteStore);

const { showMessage } = useFloatingMessage();
const deleteOrder = async () => {
    const isTemplate = orderIsTemplate.value;
    const deleteOk = await orderDeleteStore.performOrderDeletion();
    if (deleteOk) {
        orderDeleteStore.reset();
        showMessage({
            type: FloatingMessageType.Success,
            text: (isTemplate) ? t("order.delete.messages.Template deleted") : t("order.delete.messages.Order deleted")
        });
        // if possible, go back to the previous view from where the user came to this form
        const fallbackRouteName = (isTemplate) ? "order-templates-list" : "orders";
        goBackOrToRoute({ name: fallbackRouteName });
    }
};
</script>
<style scoped lang="scss">
ul.additional-content {
    @include block-list;
    @include normal-text;

    margin-top: steps(1);
    padding: steps(1) steps(2);

    li {
        margin-bottom: steps(0.5);
    }
}
</style>
