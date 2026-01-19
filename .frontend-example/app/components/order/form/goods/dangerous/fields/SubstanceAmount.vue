<template lang="pug">
FormInputField(
    v-model="value"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="substance-amount"
    :label="$t('dangerous_goods_rows.fields.Substance amount')"
    :label-visible="rowIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { recalculateOrder } = useOrderFormStore();

const { value, decimalPlaces } = useNumberFieldValue({
    recordAccessor: getDangerousGoodsRow,
    valueAttribute: "substanceAmount",
    precisionAttribute: "substanceAmountPrecision",
    decimalPlaces: 4
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    fields: ["substance_amount", "substance_amount_precision"],
});


</script>
<style scoped lang="scss"></style>
