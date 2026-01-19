<template lang="pug">
td(data-name="total-amount")
    InvoicingProcessInvoicesTableInvoiceLink(:invoice="invoice") {{ displayableValue }}
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const displayableValue = computed(() => {
    const amount = props.invoice.totals?.finalAmount;
    if (typeof amount != "number") {
        return null;
    }
    return localizeCurrencyAmount(amount);
});

</script>
<style scoped lang="scss"></style>
