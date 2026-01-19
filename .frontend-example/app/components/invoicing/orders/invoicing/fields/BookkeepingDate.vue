<template lang="pug">
FormDateField(
    v-model="form.bookkeepingDate"
    name="bookkeeping-date"
    size="large"
    container-mode="modal-dialog"
    type="date"
    :label="$t('invoicing.dialog.fields.Bookkeeping date')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const invoicingStore = useInvoicingOrdersInvoicingStore();

const { form } = storeToRefs(invoicingStore);

const errors = computed(() => form.value.errors.forField("bookkeeping_date"));

</script>
<style scoped lang="scss"></style>
