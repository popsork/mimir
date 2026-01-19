<template lang="pug">
FormInputField(
    v-model="value"
    name="receipt-number"
    :label="$t('specification_rows.fields.Receipt number')"
    :label-visible="specificationRowIndex === 0"
    :errors="errors"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { value } = useTextFieldValue({
    recordAccessor: getSpecificationRow,
    valueAttribute: "receiptNumber",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    field: "receipt_number",
});

</script>
<style scoped lang="scss"></style>
