<template lang="pug">
GenericButton(
    icon="plus-circled"
    type="secondary"
    size="small"
    v-on:click="addRow"
) {{ $t('dangerous_goods_rows.actions.Add dangerous goods row') }}
</template>
<script setup lang="ts">
const props = defineProps<{
    goodsRowId: string,
}>();

const store = useOrderFormDangerousGoodsStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addDangerousGoodsRow(props.goodsRowId);
    recalculateOrder();
    emit("add");
};

</script>
<style scoped lang="scss"></style>
