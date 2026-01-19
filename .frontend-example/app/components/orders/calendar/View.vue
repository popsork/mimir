<template lang="pug">
.body(ref="body" :style="{ height: `${availableHeight}px` }" v-on:scroll="onBodyScroll")
    OrdersCalendarItemHint(ref="hint")
    OrdersCalendarItemMenu(ref="menu")
    OrdersCalendarUnitsHeader(ref="units-header")
    WaitingBox(:while="WaitingFor.OrderRows")
        .units
            VueDraggable(v-model="selectedViewUnitIds" v-bind="draggableOptions" v-on:start="onDragStart" v-on:end="onDragEnd")
                TransitionGroup(type="transition" tag="div" :name="!dragging ? 'fade' : undefined" class="units")
                    OrdersCalendarUnitRow(v-for="unitId in selectedViewUnitIds" :id="unitId" :key="unitId")
</template>
<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";

const rowsStore = useOrdersRowsStore();
rowsStore.loadRowsIfNeeded();

const unitsStore = useOrdersCalendarUnitsStore();
const { selectedViewUnitIds } = storeToRefs(unitsStore);

const ordersStore = useOrdersCalendarOrdersStore();

ordersStore.startWatchingOrderRows();
onBeforeUnmount(() => {
    ordersStore.stopWatchingOrderRows();
});

const reasonsStore = useOrdersCalendarBlockedTimeReasonsStore();
reasonsStore.loadBlockedTimeReasonsIfNeeded();

const blockedTimePeriodsStore = useOrdersCalendarBlockedTimePeriodsStore();
blockedTimePeriodsStore.loadRecordsIfNeeded();

const draggableOptions = computed(() => {
    return {
        animation: 150,
        target: ".units",
        handle: ".sorting-handle",
        swapThreshold: 0.3
    };
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader + heights.value.secondaryPageHeader + heights.value.viewsHeader + heights.value.ordersCalendarControlsHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

const body = useTemplateRef("body");
const unitsHeader = useTemplateRef("units-header");
const hint = useTemplateRef("hint");
const menu = useTemplateRef("menu");

const onBodyScroll = () => {
    if (hint.value) {
        hint.value.updatePosition();
    }
    if (menu.value) {
        menu.value.updatePosition();
    }
};


const dragging = ref(false);

const onDragStart = () => {
    dragging.value = true;
    if (hint.value) {
        hint.value.close();
    }
    if (menu.value) {
        menu.value.close();
    }
};

const onDragEnd = () => {
    nextTick(() => {
        dragging.value = false;
    });
};

const handleNewlyAddedUnit = async (unitId: string) => {
    // NOTE: this gets also called when the unit has not been actually added
    // but was already somewhere in the list
    await nextTick();
    const unitNode = getUnitNode(unitId);
    if (!unitNode || !body.value) {
        return;
    }

    // cannot use native scrollIntoView here because browsers sometimes scroll not only the expected container
    // but the whole page as well, which should not happen
    const unitsHeaderHeight = unitsHeader.value ? unitsHeader.value.$el.offsetHeight : 0;

    body.value.scrollTo({
        top: unitNode.offsetTop - unitsHeaderHeight,
        behavior: "smooth"
    });

};

const getUnitNode = (unitId: string) => {
    // a "unit-" prefix is added to the value
    // this is to avoid CSS.escape overescaping the first character of the id if it is a number
    const attributeSelectorValue = CSS.escape(`unit-${unitId}`);
    const unitSelector = `.units .unit[data-id="${attributeSelectorValue}"]`;
    return document.querySelector(unitSelector) as HTMLElement | null;
};


defineExpose({
    handleNewlyAddedUnit
});

</script>
<style scoped lang="scss">
.body {
    overflow-y: auto;
    scrollbar-gutter: stable;
    position: relative;

    .units-header {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 100;
    }

    > .units {
        flex: 1;
        padding-bottom: steps(5);
    }

    > .units,
    > .units-header {
        margin-left: $gutter;
        margin-right: $gutter;
    }

    > .units-header :deep(.sidebar),
    > .units :deep(.unit) > .sidebar {
        flex: 0 0 steps(32.5);
        max-width: steps(32.5);
    }

    > .units :deep(.unit) {
        scroll-margin-top: steps(4);
    }

}
</style>
