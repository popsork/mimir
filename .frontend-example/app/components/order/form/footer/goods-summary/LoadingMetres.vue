<template lang="pug">
OrderFormFooterSummaryEditableField(
    v-model="editableValue"
    name="loading-metres"
    :label="label"
    :value-text="valueText"
    :decimal-places="decimalPlaces"
    :changed="valueIsManual"
)
</template>
<script setup lang="ts">
import { GoodsRow } from "~/models/GoodsRow";

const { t } = useI18n();
const label = computed(() => t("order.summaries.goods.fields.Loading metres"));

const { editableValue, decimalPlaces, valueIsManual, valueText } = useOrderFormEditableGoodsTotalField({
    valueAttribute: "loadingMetres",
    precisionAttribute: "loadingMetresPrecision",
    decimalPlaces: GoodsRow.MAX_LOADING_METRES_DECIMAL_PLACES,
});


</script>
<style scoped lang="scss"></style>
