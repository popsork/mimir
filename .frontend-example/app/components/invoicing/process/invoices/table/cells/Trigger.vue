<template lang="pug">
td(data-name="trigger")
    InvoicingProcessInvoicesTableInvoiceLink(:invoice="invoice")
        SvgImage(class="icon" name="chevron-right" :alt="$t('invoicing.process.invoices.actions.View')")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss">
td {
    a {
        justify-content: flex-end;
    }
}
</style>
