<template lang="pug">
OrderFormRemoveButton(
    :title="$t('documents.actions.Remove')"
    v-on:click="remove"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    documentIndex: number,
}>();

const store = useOrderFormDocumentsStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeDocument(props.documentIndex);
    recalculateOrder();
};

</script>
<style scoped lang="scss"></style>
