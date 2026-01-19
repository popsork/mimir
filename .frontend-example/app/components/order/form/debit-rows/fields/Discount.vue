<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="valueText"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormInputField(
    v-else
    v-model="value"
    :changed="valueIsManual"
    type="decimal"
    :decimal-places="decimalPlaces"
    v-bind="commonFieldProps"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    debitRowIndex: number,
    transportOrderId: string | null,
    debitRowType: DebitRowType | null,
}>();

const { t } = useI18n();
const commonFieldProps = computed(() => {
    return {
        name: "discount",
        label: t("debit_rows.fields.Discount (%)"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value,
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { recalculateOrder } = useOrderFormStore();

const { value, decimalPlaces, valueIsManual } = useNumberFieldValue({
    recordAccessor: getDebitRow,
    valueAttribute: "discount",
    precision: 2,
    decimalPlaces: 2,
    manualAttribute: "discountIsManual",
});

const valueText = computed(() => {
    if (!value.value) {
        return "";
    }
    return localizeNumber(value.value, { maximumFractionDigits: decimalPlaces.value });
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "discount",
});

</script>
<style scoped lang="scss"></style>
