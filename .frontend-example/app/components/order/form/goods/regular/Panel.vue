<template lang="pug">
OrderFormTabPanel(name="goods")
    h2.title {{ $t('order.fieldsets.Goods') }}
    .rows
        OrderFormGoodsRegularRow(
            v-for="(goodsRow, index) in goodsRows"
            :key="index"
            ref="rows"
            :index="index"
            :goods-row="goodsRow"
        )
    OrderFormGoodsRegularAddRowControl(v-on:add="focusLastRow")
</template>
<script setup lang="ts">
import type { GoodsRow } from "~/models/GoodsRow";

const { form } = storeToRefs(useOrderFormStore());

const goodsRows = computed(() => {
    return (form.value.order.goodsRows || []) as GoodsRow[];
});

const rowRefs = useTemplateRef("rows");

const focusLastRow = async () => {
    await nextTick();
    if (!rowRefs.value || rowRefs.value.length < 1) {
        return;
    }

    const lastRow = rowRefs.value[rowRefs.value.length - 1];
    lastRow!.focus();
};


</script>
<style scoped lang="scss">
[data-name="goods"] {
    .title {
        @include large-medium-text;
    }

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
