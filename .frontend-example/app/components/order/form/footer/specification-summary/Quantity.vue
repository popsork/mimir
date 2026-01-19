<template lang="pug">
OrderFormFooterSummaryField(name="quantity" :label="label" :value="valueText")
</template>
<script setup lang="ts">

const { t } = useI18n();
const label = computed(() => t("order.summaries.specification.fields.Quantity"));

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.specificationSummary;
});

const value = computed(() => {
    if (!summary.value) {
        return null;
    }
    return summary.value.realQuantity;
});

const valueText = computed(() => {
    if (!value.value) {
        return getBlankValueLabelText();
    }
    return localizeNumber(value.value)!;
});

</script>
<style scoped lang="scss"></style>
