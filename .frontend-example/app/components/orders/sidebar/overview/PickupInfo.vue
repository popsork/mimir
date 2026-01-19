<template lang="pug">
OrdersSidebarOverviewStopInfo(:stop-info="pickupInfo" :number="1")
</template>
<script setup lang="ts">
const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { pickupInfo } = storeToRefs(detailsSidebarStore);

</script>
<style scoped lang="scss"></style>
