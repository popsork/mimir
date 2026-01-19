<template lang="pug">
OrderFormFooterSummaryField(name="calculated-weight" :label="label" :value="valueText")
</template>
<script setup lang="ts">

const { t } = useI18n();
const label = computed(() => t("order.summaries.goods.fields.Calculated weight"));

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.goodsRowSummary;
});

const value = computed(() => {
    if (!summary.value) {
        return null;
    }
    return summary.value.realCalculatedWeight;
});

const valueText = computed(() => {
    if (value.value === null) {
        return getBlankValueLabelText();
    }
    return localizeNumber(value.value)!;
});

</script>
<style scoped lang="scss"></style>
