<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('debit_rows.actions.Add row') }}
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderId: string | null,
}>();

const store = useOrderFormDebitRowsStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addDebitRow(props.transportOrderId);
    recalculateOrder();
    emit("add");
};


</script>
<style scoped lang="scss"></style>
