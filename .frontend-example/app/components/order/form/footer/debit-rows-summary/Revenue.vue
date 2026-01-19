<template lang="pug">
OrderFormFooterSummaryField(name="total-revenue" :label="label" :value="valueText" :highlight-value="true")
</template>
<script setup lang="ts">

const props = defineProps<{
    withTax: boolean,
}>();

const { t } = useI18n();
const label = computed(() => t("order.summaries.debit_rows.fields.Total revenue"));

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.debitRowSummary;
});

const value = computed(() => {
    if (!summary.value) {
        return null;
    }
    return props.withTax ? summary.value.revenueWithTax : summary.value.revenueWithoutTax;
});

const valueText = computed(() => {
    if (!value.value) {
        return getBlankValueLabelText();
    }
    return localizeCurrencyAmount(value.value);
});

</script>
<style scoped lang="scss"></style>
