<template lang="pug">
OrderFormRemoveButton(
    :title="$t('transport_orders.actions.Remove')"
    v-on:click="remove"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const store = useOrderFormStopsStore();

const transportOrder = computed(() => {
    return store.getTransportOrderByIndex(props.transportOrderIndex);
});

const remove = () => {
    if (!transportOrder.value) {
        return;
    }

    store.setRemovableTransportOrderId(transportOrder.value.id);
};

</script>
<style scoped lang="scss"></style>
