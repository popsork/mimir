<template lang="pug">
.details
    .header
        InvoicingProcessInvoiceDetailsInvoice(:invoice="invoice")
        InvoicingProcessInvoiceDetailsCustomer(:invoice="invoice")
    InvoicingProcessInvoiceDetailsOrders(:invoice="invoice")
    InvoicingProcessInvoiceDetailsTotals(:invoice="invoice")
    .footer
        InvoicingProcessInvoiceDetailsIssuer(:invoice="invoice")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss">
.details {
    background: $color-background-lightest;
    padding: steps(4);

    .header {
        display: flex;
        width: 100%;
        gap: steps(4);
        margin-bottom: steps(2);

        .invoice,
        .customer {
            flex: 1 1 50%;
        }
    }

    .totals {
        margin-bottom: steps(4);
    }
}
</style>
