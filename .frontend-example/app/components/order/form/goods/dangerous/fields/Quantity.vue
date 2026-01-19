<template lang="pug">
FormInputField(
    v-model="value"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="quantity"
    :label="$t('dangerous_goods_rows.fields.Quantity')"
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
    valueAttribute: "quantity",
    precisionAttribute: "quantityPrecision",
    decimalPlaces: 4
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    fields: ["quantity", "quantity_precision"],
});


</script>
<style scoped lang="scss"></style>
