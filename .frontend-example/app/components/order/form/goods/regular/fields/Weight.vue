<template lang="pug">
FormInputField(
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="weight"
    :label="$t('goods_rows.fields.Weight')"
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
    valueAttribute: "weight",
    precisionAttribute: "weightPrecision",
    decimalPlaces: 6,
    manualAttribute: "weightIsManual",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["weight", "weight_precision"],
});


</script>
<style scoped lang="scss"></style>
