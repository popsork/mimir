<template lang="pug">
FormSwitchField(
    v-model="showLines"
    name="show-lines"
    :label="$t('orders.map.filters.Show lines')"
    layout="inline"
)
</template>
<script setup lang="ts">

const ordersMapStore = useOrdersMapStore();
const { showLines } = storeToRefs(ordersMapStore);

</script>
<style scoped lang="scss"></style>
