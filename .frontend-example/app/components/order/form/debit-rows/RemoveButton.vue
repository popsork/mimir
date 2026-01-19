<template lang="pug">
OrderFormRemoveButton(
    :title="$t('debit_rows.actions.Remove')"
    v-on:click="remove"
    v-on:mouseenter="handleMouseEnter"
    v-on:mouseleave="handleMouseLeave"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderId: string | null,
    debitRowIndex: number,
}>();

const store = useOrderFormDebitRowsStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeDebitRow(props.transportOrderId, props.debitRowIndex);
    recalculateOrder();
};

const { hoveredDebitRowReference } = storeToRefs(store);

// highlight the row when hovering over the remove button
// to better indicate which row will be removed
const handleMouseEnter = () => {
    hoveredDebitRowReference.value = {
        transportOrderId: props.transportOrderId,
        index: props.debitRowIndex,
    };
};
const handleMouseLeave = () => {
    hoveredDebitRowReference.value = null;
};



</script>
<style scoped lang="scss"></style>
