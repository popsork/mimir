<template lang="pug">
.orders(v-if="ordersExist")
    InvoicingProcessInvoiceDetailsOrder(v-for="(order, index) in invoice.orders" :key="index" :order="order")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const ordersExist = computed(() => {
    return (props.invoice.orders?.length ?? 0) > 0;
});

</script>
<style scoped lang="scss">
.orders {
    .order {
        margin-bottom: steps(4);
    }
}
</style>
