<template lang="pug">
OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Stop limits')")
    FormInputField(
        v-model="maxStopsInVisibleArea"
        type="integer"
        :min="0"
        :label="$t('orders.map.filters.Maximum number of stops')"
    )
    FormInputField(
        v-model="minStopsInCluster"
        type="integer"
        :min="0"
        :label="$t('orders.map.filters.Minimum number of stops in cluster')"
    )
</template>
<script setup lang="ts">
const ordersMapStore = useOrdersMapStore();
const { maxStopsInVisibleArea, minStopsInCluster } = storeToRefs(ordersMapStore);

</script>
<style scoped lang="scss">
.field {
    margin-bottom: steps(1)
}
</style>