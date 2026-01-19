<template lang="pug">
InvoicingProcessHeaderSection(:title="$t('invoicing.process.sections.Invoice summary')" name="invoice-summary")
    InvoicingProcessHeaderFieldGroup(name="invoices")
        FormReadOnlyField(
            :value="process.numberOfInvoices?.toString()"
            name="number-of-invoices"
            :label="$t('invoicing.process.fields.Invoices generated')"
            size="large"
            layout="compact"
        )
    InvoicingProcessHeaderFieldGroup(name="total-amount")
        FormReadOnlyField(
            :value="totalAmountText"
            name="total-amount"
            :label="$t('invoicing.process.fields.Total amount')"
            size="large"
            layout="compact"
        )
    InvoicingProcessHeaderFieldGroup(name="invoice-numbers")
        FormReadOnlyField(
            :value="process.firstInvoiceNumber"
            name="invoice-numbers-from"
            :label="$t('invoicing.process.fields.Invoice numbers from')"
            size="large"
            layout="compact"
        )
        FormReadOnlyField(
            :value="process.lastInvoiceNumber"
            name="invoice-numbers-till"
            :label="$t('invoicing.process.fields.to')"
            size="large"
            layout="compact"
        )
</template>
<script setup lang="ts">
const store = useInvoicingProcessStore();

const { process } = storeToRefs(store);

const { value } = useNumberFieldValue({
    recordAccessor: () => process.value,
    valueAttribute: "totalAmount",
    precisionAttribute: "totalAmountPrecision"
});

const totalAmountText = computed(() => {
    if (value.value === null) {
        return null;
    }

    return localizeCurrencyAmount(value.value);
});

</script>
<style scoped lang="scss"></style>
