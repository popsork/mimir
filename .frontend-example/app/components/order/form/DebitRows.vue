<template lang="pug">
OrderFormDebitRowsPanel(:transport-order-index="null")
OrderFormDebitRowsPanel(
    v-for="(transportOrder, index) in transportOrders"
    :key="transportOrder.id"
    :transport-order-index="index"
)
</template>
<script setup lang="ts">

const { form } = storeToRefs(useOrderFormStore());

const transportOrders = computed(() => form.value.order.transportOrders);

</script>
<style scoped lang="scss"></style>
