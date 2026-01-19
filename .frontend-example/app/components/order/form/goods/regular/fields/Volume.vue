<template lang="pug">
FormInputField(
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    name="volume"
    :label="$t('goods_rows.fields.Volume')"
    :label-visible="goodsRowIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { GoodsRow } from "~/models/GoodsRow";

const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { recalculateOrder } = useOrderFormStore();

const { value, decimalPlaces, valueIsManual } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "volume",
    precisionAttribute: "volumePrecision",
    decimalPlaces: GoodsRow.MAX_VOLUME_DECIMAL_PLACES,
    manualAttribute: "volumeIsManual",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["volume", "volume_precision"],
});

</script>
<style scoped lang="scss"></style>
