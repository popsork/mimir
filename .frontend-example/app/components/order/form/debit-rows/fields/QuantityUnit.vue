<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="valueText"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormSelectField(
    v-else
    v-model="quantityUnitId"
    :changed="getDebitRow()?.quantityUnitIdIsManual"
    v-bind="commonFieldProps"
    :options="options"
    :filterable="true"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { QuantityUnit } from "~/models/QuantityUnit";

const props = defineProps<{
    debitRowIndex: number,
    transportOrderId: string | null,
    debitRowType: DebitRowType | null,
}>();

const { t } = useI18n();
const commonFieldProps = computed(() => {
    return {
        name: "quantity-unit",
        label: t("debit_rows.fields.Quantity unit"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value,
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { recalculateOrder } = useOrderFormStore();

const quantityUnitId = computed({
    get: () => getDebitRow()?.quantityUnitId,
    set: (id: string | null) => {
        const debitRow = getDebitRow();

        if (!debitRow) {
            return;
        }

        const quantityUnit = (id) ? useRepo(QuantityUnit).find(id) : null;

        debitRow.quantityUnitId = id;
        debitRow.quantityUnitIdIsManual = true;
        debitRow.quantityUnit = quantityUnit;
    }
});


const store = useOrderFormQuantityUnitsStore();
const { quantityUnits } = storeToRefs(store);

const options = computed(() => {
    const debitRow = getDebitRow();
    if (!debitRow) {
        return [];
    }

    return buildSelectOptions({
        collection: quantityUnits.value,
        currentObject: debitRow.quantityUnit,
        builder: (quantityUnit) => {
            return {
                value: quantityUnit.id,
                label: quantityUnit.name
            };
        }
    });
});

store.loadQuantityUnitsIfNeeded();

const valueText = computed(() => {
    const quantityUnit = getDebitRow()?.quantityUnit;
    if (!quantityUnit) {
        return "";
    }
    return quantityUnit.name;
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "quantityUnit"
});


</script>
<style scoped lang="scss"></style>
