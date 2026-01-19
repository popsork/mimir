<template lang="pug">
td(data-name="customer-name")
    InvoicingProcessInvoicesTableInvoiceLink(:invoice="invoice") {{ invoice.customer?.name }}
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

defineProps<{
    invoice: Invoice,
}>();

</script>
<style scoped lang="scss"></style>
