<template lang="pug">
OrderFormFooterSummaryEditableField(
    v-model="editableValue"
    name="volume"
    :label="label"
    :value-text="valueText"
    :decimal-places="decimalPlaces"
    :changed="valueIsManual"
)
</template>
<script setup lang="ts">
import { GoodsRow } from "~/models/GoodsRow";

const { t } = useI18n();
const label = computed(() => t("order.summaries.goods.fields.Volume"));

const { editableValue, decimalPlaces, valueIsManual, valueText } = useOrderFormEditableGoodsTotalField({
    valueAttribute: "volume",
    precisionAttribute: "volumePrecision",
    decimalPlaces: GoodsRow.MAX_VOLUME_DECIMAL_PLACES,
});

</script>
<style scoped lang="scss"></style>
