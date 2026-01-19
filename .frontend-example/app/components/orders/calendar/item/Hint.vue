<template lang="pug">
OrdersCalendarItemPopover(
    v-if="shouldShowHint"
    ref="popover"
    :item="hint"
    placement="top"
    class="orders-calendar-item-hint"
    v-on:click-outside="close"
)
    OrdersCalendarItemOrderHint(v-if="hintIsForOrder" :order-id="hint.resourceId")
    OrdersCalendarItemBlockedTimePeriodHint(v-else-if="hintIsForBlockedTimePeriod" :blocked-time-period-id="hint.resourceId")
</template>
<script setup lang="ts">
const calendarStore = useOrdersCalendarStore();

const { hint } = storeToRefs(calendarStore);

const shouldShowHint = computed(() => {
    return !!hint.value.unitId && !!hint.value.itemId;
});

const hintIsForOrder = computed(() => {
    return hint.value.itemType === CalendarItemType.Order;
});
const hintIsForBlockedTimePeriod = computed(() => {
    return hint.value.itemType === CalendarItemType.BlockedTimePeriod;
});

const close = () => {
    calendarStore.deactivateHint();
};

const popover = useTemplateRef("popover");

const updatePosition = () => {
    if (popover.value) {
        popover.value.updatePosition();
    }
};

defineExpose({
    updatePosition,
    close
});

</script>
<style scoped lang="scss"></style>
<style lang="scss">
// these are global styles
.n-popover.orders-calendar-item-popover.orders-calendar-item-hint {

    &,
    .n-popover-arrow-wrapper .n-popover-arrow {
        background-color: $color-background-light;
    }
}
</style>

