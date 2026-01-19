<template lang="pug">
FormInputField(
    v-model="value"
    name="quantity"
    :label="$t('specification_rows.fields.Quantity')"
    :label-visible="specificationRowIndex === 0"
    type="decimal"
    :decimal-places="decimalPlaces"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const { value, decimalPlaces } = useNumberFieldValue({
    recordAccessor: getSpecificationRow,
    valueAttribute: "quantity",
    precisionAttribute: "quantityPrecision",
    decimalPlaces: 4
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    fields: ["quantity", "quantity_precision"],
});


</script>
<style scoped lang="scss"></style>
