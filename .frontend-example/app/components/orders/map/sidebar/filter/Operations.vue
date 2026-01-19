<template lang="pug">
OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Operations')")
    WaitingBox(:while="!operationsLoaded")
        FormMultiSelectField(
            v-model="selectedOperationIds"
            name="operation"
            :label="$t('orders.map.filters.Operations')"
            :label-visible="false"
            :options="options"
            :header-label="$t('orders.map.filters.Select operations')"
        )
</template>
<script setup lang="ts">
const ordersMapStore = useOrdersMapStore();
ordersMapStore.loadOperationsIfNeeded();

const { operationsLoaded, operationOptions, selectedOperationIds } = storeToRefs(ordersMapStore);

const options = computed(() => {
    return operationOptions.value.map((option) => ({
        value: option.id,
        label: option.name,
        selectedColor: "#4C505D", // $color-background-inverted
        selectedTextColor: "#FFFFFF" // $color-text-inverted
    }));
});
</script>
<style scoped lang="scss">
.operations-filter {
    display: flex;
    align-items: center;
    gap: steps(1);
}
</style>
