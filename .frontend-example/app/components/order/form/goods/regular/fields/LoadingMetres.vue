<template lang="pug">
FormInputField(
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="loading-metres"
    :label="$t('goods_rows.fields.Loading metres')"
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
    valueAttribute: "loadingMetres",
    precisionAttribute: "loadingMetresPrecision",
    decimalPlaces: 6,
    manualAttribute: "loadingMetresIsManual",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["loading_metres", "loading_metres_precision"],
});

</script>
<style scoped lang="scss"></style>
