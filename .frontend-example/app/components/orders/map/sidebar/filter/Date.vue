<template lang="pug">
OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Period')")
    FilterFieldsRelativeDate(v-model:days-in-past="daysInPast" v-model:days-in-future="daysInFuture")
    GenericButton(
        type="secondary"
        :title="$t('orders.map.filters.Date.Show all')"
        size="small"
        v-on:click="showAll"
    ) {{ $t('orders.map.filters.Date.Show all') }}
</template>
<script setup lang="ts">
const ordersMapStore = useOrdersMapStore();
const { daysInPast, daysInFuture } = storeToRefs(ordersMapStore);

const showAll = () => {
    daysInPast.value = null;
    daysInFuture.value = null;
};
</script>
<style scoped lang="scss">
</style>
