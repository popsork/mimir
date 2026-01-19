<template lang="pug">
FormCheckboxField(
    v-model="internalValue"
    name="attach-to-invoice"
    :label="$t('documents.fields.Attach to invoice')"
    :changed="valueIsManual"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    documentIndex: number,
}>();

const { getDocument } = useOrderFormDocumentAccessor(() => props.documentIndex);

const { recalculateOrder } = useOrderFormStore();

const { value, valueIsManual } = useCheckboxFieldValue({
    recordAccessor: getDocument,
    valueAttribute: "attachToInvoice",
    manualAttribute: "attachToInvoiceIsManual",
});

const internalValue = computed({
    get: () => value.value,
    set: (newValue: boolean | null) => {
        const document = getDocument();
        if (!document) {
            return;
        }
        value.value = newValue;

        if (document.documentType) {
            // switch manualness based on whether the new value matches the default value coming from the document type
            const defaultValue = document.documentType.attachToInvoice;
            valueIsManual.value = newValue !== defaultValue;
        } else {
            // if no document type exists, the value is considered manual if true
            valueIsManual.value = newValue === true;
        }
    },
});


const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDocument,
    fields: ["attach_to_invoice", "attach_to_invoice_is_manual"],
});

</script>
<style scoped lang="scss"></style>
