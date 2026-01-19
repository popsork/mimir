<template lang="pug">
FormInputField(
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="quantity"
    :label="$t('goods_rows.fields.Quantity')"
    :label-visible="goodsRowIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { recalculateOrder } = useOrderFormStore();

const { value, decimalPlaces, valueIsManual } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "quantity",
    precisionAttribute: "quantityPrecision",
    decimalPlaces: 4,
    manualAttribute: "quantityIsManual",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["quantity", "quantity_precision"],
});


</script>
<style scoped lang="scss"></style>
