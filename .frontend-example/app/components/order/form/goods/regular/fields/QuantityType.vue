<template lang="pug">
FormSelectField(
    v-model="quantityTypeId"
    :changed="getGoodsRow()?.quantityTypeIdIsManual"
    name="quantity-type"
    :label="$t('goods_rows.fields.Quantity type')"
    :label-visible="goodsRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { GoodsRowQuantityType } from "~/models/GoodsRowQuantityType";

const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { recalculateOrder } = useOrderFormStore();

const quantityTypeId = computed({
    get: () => getGoodsRow()?.quantityTypeId,
    set: (id: string | null) => {
        const goodsRow = getGoodsRow();

        if (!goodsRow) {
            return;
        }

        const quantityType = (id) ? useRepo(GoodsRowQuantityType).find(id) : null;

        goodsRow.quantityTypeId = id;
        goodsRow.quantityTypeIdIsManual = true;
        goodsRow.quantityType = quantityType;
    }
});


const store = useOrderFormGoodsRowQuantityTypesStore();
const { quantityTypes } = storeToRefs(store);

const options = computed(() => {
    const goodsRow = getGoodsRow();
    if (!goodsRow) {
        return [];
    }

    return buildSelectOptions({
        collection: quantityTypes.value,
        currentObject: goodsRow.quantityType,
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
    recordAccessor: getGoodsRow,
    field: "goodsRowQuantityType",
});

</script>
<style scoped lang="scss"></style>
