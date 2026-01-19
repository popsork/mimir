<template lang="pug">
OrderFormRemoveButton(
    :title="$t('dangerous_goods_rows.actions.Remove')"
    v-on:click="remove"
    v-on:mouseenter="handleMouseEnter"
    v-on:mouseleave="handleMouseLeave"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    dangerousGoodsRowId: string,
}>();

const store = useOrderFormDangerousGoodsStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeDangerousGoodsRow(props.dangerousGoodsRowId);
    recalculateOrder();
};

const { hoveredDangerousGoodsRowId } = storeToRefs(store);

// highlight the row when hovering over the remove button
// to better indicate which row will be removed
const handleMouseEnter = () => {
    hoveredDangerousGoodsRowId.value = props.dangerousGoodsRowId;
};
const handleMouseLeave = () => {
    hoveredDangerousGoodsRowId.value = null;
};

</script>
<style scoped lang="scss"></style>
