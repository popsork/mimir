<template lang="pug">
OrderFormTabPanel(name="history")
    WaitingBox(:while="WaitingFor.OrderFormAuditEntries")
        OrderFormHistoryTable
</template>
<script setup lang="ts">

const { order, orderIsNew, orderIsMissing } = storeToRefs(useOrderFormStore());

const orderId = computed(() => order.value.id);

const auditEntriesStore = useOrderFormAuditEntriesStore();

watch(orderId, (newOrderId) => {
    auditEntriesStore.reset();
    if (newOrderId && !orderIsNew.value && !orderIsMissing.value) {
        auditEntriesStore.loadAuditEntries({ orderId: newOrderId });
    }
}, { immediate: true });

</script>
<style scoped lang="scss">
fieldset[data-name="history"] {
    padding-top: steps(0.5);
    margin-bottom: steps(4);
}
</style>
