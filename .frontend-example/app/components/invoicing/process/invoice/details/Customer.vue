<template lang="pug">
.customer
    h3.heading {{ $t("invoicing.process.invoice.headings.Customer") }} {{ customer?.number }}
    InvoicingProcessInvoiceDetailsKeyValueList(:values="values" :columns="2"  :break-after-items="2")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const { t } = useI18n();

const customer = computed(() => {
    return props.invoice.customer;
});

const address = computed(() => {
    return customer.value?.address;
});

const values = computed(() => {
    return [
        {
            label: t("invoicing.process.invoice.fields.customer.Name"),
            value: customer.value?.name,
        },
        {
            label: t("invoicing.process.invoice.fields.customer.VAT number"),
            value: customer.value?.vatNumber,
        },
        {
            label: t("invoicing.process.invoice.fields.customer.GLN"),
            value: customer.value?.gln,
        },
        {
            label: t("invoicing.process.invoice.fields.customer.Address"),
            value: address.value ? [
                `${address.value.streetName} ${address.value.streetNumber}`,
                `${address.value.postalCode} ${address.value.city}`,
                `${address.value.country}`,
            ].join("\n") : null
        },
    ];
});

</script>
<style scoped lang="scss">
.customer {
    .heading {
        @include normal-heading;
    }
}
</style>
