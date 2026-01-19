<template lang="pug">
FormInputField(
    v-model="value"
    name="hours"
    :label="$t('specification_rows.fields.Hours')"
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
    valueAttribute: "hours",
    precisionAttribute: "hoursPrecision",
    decimalPlaces: 2
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    fields: ["hours", "hours_precision"],
});

</script>
<style scoped lang="scss"></style>
