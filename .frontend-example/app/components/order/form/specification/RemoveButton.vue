<template lang="pug">
OrderFormRemoveButton(
    :title="$t('specification_rows.actions.Remove')"
    v-on:click="remove"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    specificationRowIndex: number,
}>();

const store = useOrderFormSpecificationStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeSpecificationRow(props.specificationRowIndex);
    recalculateOrder();
};

</script>
<style scoped lang="scss"></style>
