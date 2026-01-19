<template lang="pug">
OrdersMapSidebarFilterGroup(:title="$t('orders.map.filters.Status')")
    .checkboxes
        FormCheckboxField(
            v-for="transportOrderStatus in availableStatuses"
            :key="transportOrderStatus"
            v-model="selectedStatuses"
            :value="transportOrderStatus"
            :label="$t(`transport_orders.statuses.${transportOrderStatus}`)")
</template>
<script setup lang="ts">
const ordersMapStore = useOrdersMapStore();

const { selectedStatuses } = storeToRefs(ordersMapStore);

// the order-list dataset does not contain rows with statuses after "verified" (the invoicing phase etc)
// so we should not show checkboxes for those statuses here
const availableStatuses = [
    TransportOrderStatusName.Pending,
    TransportOrderStatusName.Planned,
    TransportOrderStatusName.Dispatched,
    TransportOrderStatusName.Accepted,
    TransportOrderStatusName.Started,
    TransportOrderStatusName.Completed,
    TransportOrderStatusName.Verified,
];

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
