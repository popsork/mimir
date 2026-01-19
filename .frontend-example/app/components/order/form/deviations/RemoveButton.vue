<template lang="pug">
OrderFormRemoveButton(
    :title="$t('deviation_rows.actions.Remove')"
    v-on:click="remove"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    deviationRowIndex: number,
}>();

const store = useOrderFormDeviationsStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeDeviationRow(props.deviationRowIndex);
    recalculateOrder();
};

</script>
<style scoped lang="scss"></style>
