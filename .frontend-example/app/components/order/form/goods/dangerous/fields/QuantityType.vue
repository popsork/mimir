<template lang="pug">
FormSelectField(
    v-model="quantityTypeId"
    name="quantity-type"
    :label="$t('dangerous_goods_rows.fields.Quantity type')"
    :label-visible="rowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { DangerousGoodsRowQuantityType } from "~/models/DangerousGoodsRowQuantityType";

const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { recalculateOrder } = useOrderFormStore();

const quantityTypeId = computed({
    get: () => getDangerousGoodsRow()?.quantityTypeId,
    set: (id: string | null) => {
        const dangerousGoodsRow = getDangerousGoodsRow();

        if (!dangerousGoodsRow) {
            return;
        }

        const quantityType = (id) ? useRepo(DangerousGoodsRowQuantityType).find(id) : null;

        dangerousGoodsRow.quantityTypeId = id;
        dangerousGoodsRow.quantityType = quantityType;
    }
});


const store = useOrderFormDangerousGoodsRowQuantityTypesStore();
const { quantityTypes } = storeToRefs(store);

const options = computed(() => {
    const dangerousGoodsRow = getDangerousGoodsRow();
    if (!dangerousGoodsRow) {
        return [];
    }

    return buildSelectOptions({
        collection: quantityTypes.value,
        currentObject: dangerousGoodsRow.quantityType,
        builder: (quantityType) => {
            return {
                value: quantityType.id,
                label: quantityType.name
            };
        }
    });
});

store.loadQuantityTypesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "dangerousGoodsRowQuantityType",
});

</script>
<style scoped lang="scss"></style>
