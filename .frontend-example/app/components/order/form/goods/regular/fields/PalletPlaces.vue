<template lang="pug">
FormInputField(
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="pallet-places"
    :label="$t('goods_rows.fields.Pallet places')"
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
    valueAttribute: "palletPlaces",
    precisionAttribute: "palletPlacesPrecision",
    decimalPlaces: 6,
    manualAttribute: "palletPlacesIsManual",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["pallet_places", "pallet_places_precision"],
});

</script>
<style scoped lang="scss"></style>
