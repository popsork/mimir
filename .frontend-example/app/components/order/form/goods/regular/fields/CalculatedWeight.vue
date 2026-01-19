<template lang="pug">
FormReadOnlyField(
    :value="caclculatedWeightText"
    name="calculated-weight"
    :label="$t('goods_rows.fields.Calculated weight')"
    :label-visible="goodsRowIndex === 0"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { value } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "calculatedWeight",
    precisionAttribute: "calculatedWeightPrecision"
});


const caclculatedWeightText = computed(() => {
    if (value.value === null) {
        return null;
    }

    return localizeNumber(value.value);
});


</script>
<style scoped lang="scss"></style>
