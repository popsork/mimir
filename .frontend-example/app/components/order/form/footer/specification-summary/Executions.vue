<template lang="pug">
OrderFormFooterSummaryField(name="executions" :label="label" :value="valueText")
</template>
<script setup lang="ts">

const { t } = useI18n();
const label = computed(() => t("order.summaries.specification.fields.Executions"));

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.specificationSummary;
});

const value = computed(() => {
    if (!summary.value) {
        return null;
    }
    return summary.value.executions;
});

const valueText = computed(() => {
    if (!value.value) {
        return getBlankValueLabelText();
    }
    return localizeNumber(value.value)!;
});

</script>
<style scoped lang="scss"></style>
