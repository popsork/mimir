<template lang="pug">
OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Stop type')")
    .checkboxes
        FormCheckboxField(
            v-for="stopType in StopType"
            :key="stopType"
            v-model="selectedStopTypes"
            :value="stopType"
            :label="$t(`orders.map.filters.stop_types.${stopType}`)")
</template>
<script setup lang="ts">
const ordersMapStore = useOrdersMapStore();

const { selectedStopTypes } = storeToRefs(ordersMapStore);
</script>
<style scoped lang="scss">
.checkboxes {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: steps(2);
    flex-wrap: wrap;
}
</style>
