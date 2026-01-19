<template lang="pug">
fieldset.footer(ref="footer")
    .content
        p.invoice-pending(v-if="orderCanBeSwitchedToInvoicing")
            GenericButton(type="secondary" :waiting="waiting" v-on:click="switchOrderToInvoicing")
                span Make order invoice-pending (for testing)
        OrderFormFooterSummary
        OrderFormFooterActions
</template>
<script setup lang="ts">

useElementHeightTracking("orderFormFooter", useTemplateRef("footer"));

const store = useOrderFormStore();

const { order, orderIsNew } = storeToRefs(store);
const orderCanBeSwitchedToInvoicing = computed(() => {
    if (orderIsNew.value || !order.value.phase) {
        return false;
    }
    return [
        OrderPhase.Preliminary,
        OrderPhase.Opeartive
    ].includes(order.value.phase);
});

const waiting = ref(false);

const switchOrderToInvoicing = async () => {
    try {
        waiting.value = true;
        await useApi().createOrderStatus({
            orderId: order.value.id,
            status: OrderStatus.InvoicePending
        });
        store.recalculateOrder();
    } finally {
        waiting.value = false;
    }

};

</script>
<style scoped lang="scss">
.footer {
    position: relative; // this is needed for the footer to go over the input fields in the tabs

    padding: steps(2.5) 0;

    @include horizontal-panel-shadow;

    .content {
        display: flex;
        gap: steps(2);

        width: 100%;
        max-width: $max-order-form-width;
        margin-left: auto;
        margin-right: auto;

        padding-left: $gutter;
        padding-right: #{$gutter + steps(3)};
    }

    .invoice-pending {
        position: absolute;
        top: steps(-5);
        background: $color-background-lightest;
        z-index: 1;
    }

    .summary {
        flex: 1 1 auto;
    }

    .actions {
        margin-left: auto;
        flex: 0 0 auto;
    }
}
</style>
