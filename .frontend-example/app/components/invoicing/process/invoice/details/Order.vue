<template lang="pug">
.order
    InvoicingProcessInvoiceDetailsOrderHeader(:order="order")
    InvoicingProcessInvoiceDetailsOrderGoodsRows(:goods-rows="order.goodsRows || []")
    InvoicingProcessInvoiceDetailsOrderSpecificationRows(:specification-rows="order.specificationRows || []")
    InvoicingProcessInvoiceDetailsOrderDebitRows(:debit-rows="order.debitRows || []")
</template>
<script setup lang="ts">
import type { InvoiceOrder } from "~/models/Invoice";

defineProps<{
    order: InvoiceOrder,
}>();

</script>
<style scoped lang="scss">
.order {
    border: 1px solid $color-border-normal;
    padding: steps(2);

    .header,
    table {
        margin-bottom: steps(2);
    }
}
</style>
