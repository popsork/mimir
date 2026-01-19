<template lang="pug">
OrdersSidebarOverviewStopInfo(:stop-info="deliveryInfo" :number="2")
</template>
<script setup lang="ts">
const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { deliveryInfo } = storeToRefs(detailsSidebarStore);

</script>
<style scoped lang="scss"></style>
