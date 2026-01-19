<template lang="pug">
.header(ref="header")
    .range-selectors
        OrdersCalendarTimeSelector
        OrdersCalendarStartSelector
        OrdersCalendarLengthSelector
        OrdersCalendarDayNavigation
    OrdersCalendarSettings
    OrdersCalendarAddUnitControl

</template>
<script setup lang="ts">

useElementHeightTracking("ordersCalendarControlsHeader", useTemplateRef("header"));

</script>
<style scoped lang="scss">
.header {
    height: steps(6.5);

    @include content-padding;
    margin-right: $gutter;

    display: flex;
    align-items: center;

    .range-selectors {
        display: flex;
        gap: steps(1);
        align-items: center;
    }

    .settings {
        margin-left: steps(1);
    }

    .add-unit {
        margin-left: auto;
    }

}
</style>
