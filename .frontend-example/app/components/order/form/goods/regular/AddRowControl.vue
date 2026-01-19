<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('goods_rows.actions.Add row') }}
</template>
<script setup lang="ts">

const store = useOrderFormGoodsStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addGoodsRow();
    recalculateOrder();
    emit("add");
};


</script>
<style scoped lang="scss"></style>
