<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('documents.actions.Add row') }}
</template>
<script setup lang="ts">

const store = useOrderFormDocumentsStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addDocument();
    recalculateOrder();
    emit("add");
};

</script>
<style scoped lang="scss"></style>
