<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('deviation_rows.actions.Add row') }}
</template>
<script setup lang="ts">

const store = useOrderFormDeviationsStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addDeviationRow();
    recalculateOrder();
    emit("add");
};


</script>
<style scoped lang="scss"></style>
