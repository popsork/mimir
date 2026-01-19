<template lang="pug">
OrdersCalendarItemPopover(
    v-if="shouldShowMenu"
    ref="popover"
    :item="menu"
    placement="bottom"
    :raw="true"
    class="orders-calendar-item-menu"
    v-on:click-outside="close"
    v-on:scroll-out-of-boundds="close"
)
    OrdersCalendarItemOrderMenu(v-if="menuIsForOrder" :order-id="menu.resourceId")
    OrdersCalendarItemBlockedTimePeriodMenu(v-else-if="menuIsForBlockedTimePeriod" :blocked-time-period-id="menu.resourceId")
    OrdersCalendarItemNewItemMenu(v-else-if="menuIsForNewItem")
</template>
<script setup lang="ts">
const calendarStore = useOrdersCalendarStore();

const { menu } = storeToRefs(calendarStore);

const shouldShowMenu = computed(() => {
    return !!menu.value.unitId && (!!menu.value.itemId || menuIsForNewItem.value);
});

const menuIsForOrder = computed(() => {
    return menu.value.itemType === CalendarItemType.Order;
});
const menuIsForBlockedTimePeriod = computed(() => {
    return menu.value.itemType === CalendarItemType.BlockedTimePeriod;
});
const menuIsForNewItem = computed(() => {
    return menu.value.itemType === CalendarItemType.NewItem;
});

const close = () => {
    calendarStore.deactivateMenu();
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
.n-popover.orders-calendar-item-popover.orders-calendar-item-menu {

    padding: 3px;
    border-radius: $element-border-radius;
}
</style>
