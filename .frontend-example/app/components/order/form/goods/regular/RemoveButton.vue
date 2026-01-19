<template lang="pug">
OrderFormRemoveButton(
    :title="$t('goods_rows.actions.Remove')"
    v-on:click="remove"
    v-on:mouseenter="handleMouseEnter"
    v-on:mouseleave="handleMouseLeave"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    goodsRowIndex: number,
}>();

const store = useOrderFormGoodsStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeGoodsRow(props.goodsRowIndex);
    recalculateOrder();
};


const { hoveredGoodsRowIndex } = storeToRefs(store);

// highlight the row when hovering over the remove button
// to better indicate which row will be removed
const handleMouseEnter = () => {
    hoveredGoodsRowIndex.value = props.goodsRowIndex;
};
const handleMouseLeave = () => {
    hoveredGoodsRowIndex.value = null;
};

</script>
<style scoped lang="scss"></style>
