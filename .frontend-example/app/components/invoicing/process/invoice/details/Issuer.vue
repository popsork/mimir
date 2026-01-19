<template lang="pug">
.issuer
    h3.heading {{ $t("invoicing.process.invoice.headings.Issuer") }}
    InvoicingProcessInvoiceDetailsKeyValueList(:values="values" :columns="4")
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const { t } = useI18n();

const issuer = computed(() => {
    return props.invoice.issuer;
});

const address = computed(() => {
    return issuer.value?.address;
});

const values = computed(() => {
    return [
        {
            label: t("invoicing.process.invoice.fields.issuer.Name"),
            value: issuer.value?.name,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.Organization number"),
            value: issuer.value?.organizationNumber,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.VAT number"),
            value: issuer.value?.vatNumber,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.IBAN"),
            value: issuer.value?.iban,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.SWIFT"),
            value: issuer.value?.swift,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.Bank"),
            value: issuer.value?.bank,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.Bankgiro"),
            value: issuer.value?.bankgiro,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.Website"),
            value: issuer.value?.website,
        },
        {
            label: t("invoicing.process.invoice.fields.issuer.Phone"),
            value: issuer.value?.phone,
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
.issuer {
    .heading {
        @include normal-heading;
    }
}
</style>
