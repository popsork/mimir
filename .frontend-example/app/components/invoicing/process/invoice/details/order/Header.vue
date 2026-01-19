<template lang="pug">
.header
    h4.heading {{ $t("invoicing.process.invoice.headings.Order") }} {{ order.number }}
    InvoicingProcessInvoiceDetailsKeyValueList(:values="values" :columns="3" :break-after-items="[2, 4]")
</template>
<script setup lang="ts">
import type { InvoiceOrder } from "~/models/Invoice";

const props = defineProps<{
    order: InvoiceOrder,
}>();

const { t } = useI18n();

const values = computed(() => {
    return [
        {
            label: t("invoicing.process.invoice.fields.order.Start date"),
            value: props.order.startDateText,
        },
        {
            label: t("invoicing.process.invoice.fields.order.End date"),
            value: props.order.endDateText,
        },
        {
            label: t("invoicing.process.invoice.fields.order.First stop name"),
            value: props.order.firstStopName,
        },
        {
            label: t("invoicing.process.invoice.fields.order.Last stop name"),
            value: props.order.lastStopName,
        },
        {
            label: t("invoicing.process.invoice.fields.order.Contact name"),
            value: props.order.contactName,
        },
        {
            label: t("invoicing.process.invoice.fields.order.Waybill number"),
            value: props.order.waybillNumber,
        },
        {
            label: t("invoicing.process.invoice.fields.order.Customer reference"),
            value: props.order.customerReference,
        },
    ];
});

</script>
<style scoped lang="scss">
.header {
    .heading {
        @include small-heading;
    }
}
</style>
