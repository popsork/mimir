<template lang="pug">
OrderFormFooterSummaryEditableField(
    v-model="editableValue"
    name="pallet-places"
    :label="label"
    :value-text="valueText"
    :decimal-places="decimalPlaces"
    :changed="valueIsManual"
)
</template>
<script setup lang="ts">
import { GoodsRow } from "~/models/GoodsRow";


const { t } = useI18n();
const label = computed(() => t("order.summaries.goods.fields.Pallet places"));

const { editableValue, decimalPlaces, valueIsManual, valueText } = useOrderFormEditableGoodsTotalField({
    valueAttribute: "palletPlaces",
    precisionAttribute: "palletPlacesPrecision",
    decimalPlaces: GoodsRow.MAX_PALLET_PLACES_DECIMAL_PLACES,
});


</script>
<style scoped lang="scss"></style>
