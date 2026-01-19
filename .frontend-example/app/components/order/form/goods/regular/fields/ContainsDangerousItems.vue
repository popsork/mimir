<template lang="pug">
FormCustomField(
    name="dangerous-items"
    :label="$t('goods_rows.fields.Dangerous')"
    :label-visible="goodsRowIndex === 0"
)
    template(v-if="containsDangerousItems")
        span.indicator(:title="$t('goods_rows.fields.Contains dangerous items')")
            SvgImage(class="icon" name="warning-sign" )
    template(v-else)
        GenericButton(
            size="small"
            type="ghost"
            icon="warning-sign"
            :title="$t('dangerous_goods_rows.actions.Add dangerous goods row')"
            v-on:click="addDangerousGoodsRow"
        )
</template>
<script setup lang="ts">
const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const dangerousGoodsStore = useOrderFormDangerousGoodsStore();

const containsDangerousItems = computed(() => {
    const row = getGoodsRow();
    if (!row) {
        return false;
    }

    const dangerousGoodsRows = dangerousGoodsStore.getDangerousGoodsRowsByGoodsRowId(row.id);
    return dangerousGoodsRows.length > 0;
});

const { recalculateOrder } = useOrderFormStore();

const addDangerousGoodsRow = () => {
    const goodsRowId = getGoodsRow()?.id;
    if (!goodsRowId) {
        return;
    }

    dangerousGoodsStore.addDangerousGoodsRow(goodsRowId);

    recalculateOrder();
};

</script>
<style scoped lang="scss">
.indicator {
    width: steps(3);
    height: steps(3);
    border-radius: steps(3);

    display: flex;
    align-items: center;
    justify-content: center;

    background: $color-background-inverted;
    color: $color-text-inverted;
}
</style>
