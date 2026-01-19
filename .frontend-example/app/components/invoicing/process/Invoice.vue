<template lang="pug">
.invoice
    InvoicingProcessInvoiceBackLink
    InvoicingProcessInvoiceDetails(:invoice="invoice")
    InvoicingProcessInvoiceActions(:invoice="invoice")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss">
.invoice {
    display: flex;
    justify-content: space-between;

    .back-link,
    .actions {
        flex: 0 0 auto;
        min-width: max-content;
    }

    .details {
        flex: 0 1 50%;
        min-width: steps(120);
        max-width: steps(140);
    }
}
</style>
