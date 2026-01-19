<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="value"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormInputField(
    v-else
    v-model="value"
    :changed="valueIsManual"
    v-bind="commonFieldProps"
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
        name: "specification",
        label: t("debit_rows.fields.Specification"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { value, valueIsManual } = useTextFieldValue({
    recordAccessor: getDebitRow,
    valueAttribute: "specification",
    manualAttribute: "specificationIsManual"
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "specification",
});

</script>
<style scoped lang="scss"></style>
