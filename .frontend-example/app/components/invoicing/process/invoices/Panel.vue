<template lang="pug">
InvoicingProcessTabPanel(name="invoices")
    template(v-if="selectedInvoice")
        InvoicingProcessInvoice(:invoice="selectedInvoice")
    template(v-else)
        InvoicingProcessInvoicesTable(:invoices="process.invoices || []")
</template>
<script setup lang="ts">

const store = useInvoicingProcessStore();

const { process } = storeToRefs(store);

const route = useRoute();

const selectedInvoice = computed(() => {
    if (!route.query.invoiceId) {
        return null;
    }
    return process.value.invoices?.find(invoice => invoice.id === route.query.invoiceId);
});


</script>
<style scoped lang="scss"></style>
