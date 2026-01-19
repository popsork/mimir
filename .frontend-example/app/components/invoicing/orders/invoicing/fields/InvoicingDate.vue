<template lang="pug">
FormDateField(
    ref="field"
    v-model="invoicingDate"
    name="invoicing-date"
    size="large"
    container-mode="modal-dialog"
    type="date"
    :label="$t('invoicing.dialog.fields.Invoicing date')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const invoicingStore = useInvoicingOrdersInvoicingStore();

const { form } = storeToRefs(invoicingStore);

const invoicingDate = computed({
    get: () => form.value.invoicingDate,
    set: (value: string) => {
        form.value.invoicingDate = value;
        // bookkeeping date should be set to the same as invoicing date, but it can be manually changed afterwards
        form.value.bookkeepingDate = value;
    },

});

const field = useTemplateRef("field");

const focus = () => {
    field.value?.focus();
};

defineExpose({
    focus,
});

const errors = computed(() => form.value.errors.forField("invoice_date"));


</script>
<style scoped lang="scss"></style>
