<template lang="pug">
FormSelectField(
    v-model="unitedNationsNumberId"
    name="united-nations-number"
    :label="$t('dangerous_goods_rows.fields.United Nations number')"
    :label-visible="rowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { UnitedNationsNumber } from "~/models/UnitedNationsNumber";

const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { recalculateOrder } = useOrderFormStore();

const unitedNationsNumberId = computed({
    get: () => getDangerousGoodsRow()?.unitedNationsNumberId,
    set: (id: string | null) => {
        const dangerousGoodsRow = getDangerousGoodsRow();

        if (!dangerousGoodsRow) {
            return;
        }

        const unitedNationsNumber = (id) ? useRepo(UnitedNationsNumber).find(id) : null;

        dangerousGoodsRow.unitedNationsNumberId = id;
        dangerousGoodsRow.unitedNationsNumber = unitedNationsNumber;
        dangerousGoodsRow.adrClass = unitedNationsNumber?.adrClass ?? null;
    }
});


const store = useOrderFormUnitedNationsNumbersStore();
const { unitedNationsNumbers } = storeToRefs(store);

const options = computed(() => {
    const dangerousGoodsRow = getDangerousGoodsRow();
    if (!dangerousGoodsRow) {
        return [];
    }

    return buildSelectOptions({
        collection: unitedNationsNumbers.value,
        currentObject: dangerousGoodsRow.unitedNationsNumber,
        builder: (unitedNationsNumber) => {
            return {
                value: unitedNationsNumber.id,
                label: unitedNationsNumber.label
            };
        }
    });
});

store.loadUnitedNationsNumbersIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "unitedNationsNumber",
});

</script>
<style scoped lang="scss"></style>
