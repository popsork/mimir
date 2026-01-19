<template lang="pug">
td(data-name="invoice-number")
    InvoicingProcessInvoicesTableInvoiceLink(:invoice="invoice") {{ invoice.number }}
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss"></style>
