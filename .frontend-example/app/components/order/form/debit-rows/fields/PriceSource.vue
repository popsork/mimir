<template lang="pug">
FormReadOnlyField(
    :value="priceSourceText"
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
        name: "price-source",
        label: t("debit_rows.fields.Price source"),
        labelVisible: props.debitRowIndex === 0
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const priceSourceText = computed(() => {
    const debitRow = getDebitRow();
    if (!debitRow) {
        return null;
    }

    if (debitRow.price === null) {
        return null;
    }

    if (debitRow.priceSource) {
        return debitRow.priceSource;
    }

    return t("debit_rows.Manual price");
});


</script>
<style scoped lang="scss"></style>
