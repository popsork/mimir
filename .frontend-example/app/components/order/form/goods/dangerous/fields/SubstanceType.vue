<template lang="pug">
FormSelectField(
    v-model="substanceTypeId"
    name="substance-type"
    :label="$t('dangerous_goods_rows.fields.Substance type')"
    :label-visible="rowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { DangerousGoodsRowSubstanceType } from "~/models/DangerousGoodsRowSubstanceType";

const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { recalculateOrder } = useOrderFormStore();

const substanceTypeId = computed({
    get: () => getDangerousGoodsRow()?.substanceTypeId,
    set: (id: string | null) => {
        const dangerousGoodsRow = getDangerousGoodsRow();

        if (!dangerousGoodsRow) {
            return;
        }

        const substanceType = (id) ? useRepo(DangerousGoodsRowSubstanceType).find(id) : null;

        dangerousGoodsRow.substanceTypeId = id;
        dangerousGoodsRow.substanceType = substanceType;
    }
});


const store = useOrderFormDangerousGoodsRowSubstanceTypesStore();
const { substanceTypes } = storeToRefs(store);

const options = computed(() => {
    const dangerousGoodsRow = getDangerousGoodsRow();
    if (!dangerousGoodsRow) {
        return [];
    }

    return buildSelectOptions({
        collection: substanceTypes.value,
        currentObject: dangerousGoodsRow.substanceType,
        builder: (substanceType) => {
            return {
                value: substanceType.id,
                label: substanceType.name
            };
        }
    });
});

store.loadSubstanceTypesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "dangerousGoodsRowSubstanceType",
});

</script>
<style scoped lang="scss"></style>
