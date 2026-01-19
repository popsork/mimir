<template lang="pug">
.header(ref="header")
    OrdersMapHeaderOperationsFilter
    OrdersMapHeaderDateFilter
    OrdersMapHeaderStatusFilter
    OrdersMapHeaderLinesSwitch
</template>
<script setup lang="ts">

useElementHeightTracking("ordersMapControlsHeader", useTemplateRef("header"));

</script>
<style scoped lang="scss">
.header {
    $filter-border: 1px solid $color-border-light;

    min-height: steps(6.5);

    margin: 0 $gutter;

    display: flex;
    align-items: center;
    gap: steps(2);

    .operations-filter {
        width: steps(40);
        padding-right: steps(2.5);
        border-right: $filter-border;
    }

    [data-name="transport-status"] {
        padding: 0 steps(2.5);
        border-left: $filter-border;
    }

    .field[data-name="show-lines"] {
        margin-left: auto;
        white-space: nowrap;
    }
}
</style>
