<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('specification_rows.actions.Add row') }}
</template>
<script setup lang="ts">

const store = useOrderFormSpecificationStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addSpecificationRow();
    recalculateOrder();
    emit("add");
};


</script>
<style scoped lang="scss"></style>
