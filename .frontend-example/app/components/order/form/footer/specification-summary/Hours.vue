<template lang="pug">
OrderFormFooterSummaryField(name="hours" :label="label" :value="valueText")
</template>
<script setup lang="ts">

const { t } = useI18n();
const label = computed(() => t("order.summaries.specification.fields.Hours"));

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.specificationSummary;
});

const value = computed(() => {
    if (!summary.value) {
        return null;
    }
    return summary.value.realHours;
});

const valueText = computed(() => {
    if (!value.value) {
        return getBlankValueLabelText();
    }
    return localizeNumber(value.value)!;
});

</script>
<style scoped lang="scss"></style>
