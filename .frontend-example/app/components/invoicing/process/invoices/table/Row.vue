<template lang="pug">
tr
    InvoicingProcessInvoicesTableCellsInvoiceNumber(:invoice="invoice")
    InvoicingProcessInvoicesTableCellsCustomerName(:invoice="invoice")
    InvoicingProcessInvoicesTableCellsTotalAmount(:invoice="invoice")
    InvoicingProcessInvoicesTableCellsTrigger(:invoice="invoice")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss"></style>
