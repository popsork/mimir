<template lang="pug">
.invoice
    h3.heading {{ $t("invoicing.process.invoice.headings.Invoice") }} {{ invoice.number }}
    InvoicingProcessInvoiceDetailsKeyValueList(:values="values" :columns="2" :break-after-items="2")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const { t } = useI18n();
const values = computed(() => {
    return [
        {
            label: t("invoicing.process.invoice.fields.Invoice date"),
            value: props.invoice.invoiceDate,
        },
        {
            label: t("invoicing.process.invoice.fields.Bookkeeping date"),
            value: props.invoice.bookkeepingDate,
        },
        {
            label: t("invoicing.process.invoice.fields.Payment terms (days)"),
            value: props.invoice.paymentTermsDays,
        },
    ];
});

</script>
<style scoped lang="scss">
.invoice {
    .heading {
        @include normal-heading;
    }
}
</style>
