<template lang="pug">
.panel(v-if="goodsRow && dangerousGoodsRowsExist" data-name="dangerous-goods")
    .rows
        OrderFormGoodsDangerousRow(
            v-for="(dangerousGoodsRow, index) in dangerousGoodsRows"
            :key="index"
            ref="rows"
            :dangerous-goods-row="dangerousGoodsRow"
            :dangerous-goods-row-index="index"
        )
    OrderFormGoodsDangerousAddRowControl(:goods-row-id="goodsRow.id")

</template>
<script setup lang="ts">
import type { DangerousGoodsRow } from "~/models/DangerousGoodsRow";

const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const goodsRow = computed(() => getGoodsRow());

const dangerousGoodsStore = useOrderFormDangerousGoodsStore();

const dangerousGoodsRows = computed(() => {
    if (!goodsRow.value) {
        return [];
    }

    return dangerousGoodsStore.getDangerousGoodsRowsByGoodsRowId(goodsRow.value.id) as DangerousGoodsRow[];
});

const dangerousGoodsRowsExist = computed(() => dangerousGoodsRows.value.length > 0);

</script>
<style scoped lang="scss">
.panel {
    padding-left: steps(4);
    padding-right: steps(4);

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
