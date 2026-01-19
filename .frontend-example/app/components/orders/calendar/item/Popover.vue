<template lang="pug">
NPopover(
    class="orders-calendar-item-popover"
    :show="shouldShowPopover"
    :data-type="item.itemType"
    :show-arrow="placement == 'top'"
    :placement="placementAttribute"
    :on-clickoutside="handleOutsideClick"
    trigger="manual"
    :x="position.x"
    :y="position.y"
)
    slot
</template>
<script setup lang="ts">
const props = defineProps<{
    item: NullableCalendarInteractionItem,
    placement: "top" | "bottom",
}>();

const emit = defineEmits<{
    (e: "click-outside"): void,
    (e: "scroll-out-of-boundds"): void,
}>();

const placementAttribute = computed(() => {
    return (props.placement === "bottom") ? "bottom-end" : props.placement;
});

const item = computed(() => props.item);

const shouldShowPopover = computed(() => {
    return !!item.value.unitId && (!!item.value.itemId || itemIsNew.value);
});

const position = ref({ x: 0, y: 0 });

const updatePosition = () => {
    if (!shouldShowPopover.value) {
        return;
    }
    position.value = calculatePosition();
};

const itemIsNew = computed(() => item.value.itemType === CalendarItemType.NewItem);

const getItemNode = () => {
    return (itemIsNew.value) ? getNewItemNode() : getExistingItemNode();
};

const getCalendarSelector = (unitId: string) => {
    return `.calendar[data-unit-id='${CSS.escape(unitId)}']`;
};

const itemSelector = computed(() => {
    return "article.ec-event";
});

const getExistingItemNode = () => {
    if (!item.value.unitId || !item.value.itemId) {
        return null;
    }
    const segmentIndex = item.value.segmentIndex;

    const contentSelector = `${getCalendarSelector(item.value.unitId)} .item-content[data-item-id='${CSS.escape(item.value.itemId)}']`;

    const contentNodes = document.querySelectorAll(contentSelector);
    const contenNodeIndex = (segmentIndex && segmentIndex < contentNodes.length) ? segmentIndex : 0;
    const contentNode = contentNodes[contenNodeIndex];
    if (!contentNode) {
        return null;
    }

    return contentNode.closest(itemSelector.value);
};

const getNewItemNode = () => {
    if (!item.value.unitId) {
        return null;
    }
    const contentSelector = `${getCalendarSelector(item.value.unitId)} .item-content[data-type='new-item']`;

    // new item menu always ignores segment index and is displayed under the last segment,
    // regardless in which direction the new item was drawn
    const contentNodes = document.querySelectorAll(contentSelector);
    const contentNode = contentNodes[contentNodes.length - 1];
    if (!contentNode) {
        return null;
    }

    return contentNode.closest(itemSelector.value);
};

const handleOutsideClick = (event: MouseEvent) => {
    // emit click-outside, but only if the click is not within the item itself,
    // to avoid closing the popover due to outside click
    // and then immediately re-opening it because the click was on the item
    const itemNode = getItemNode();
    if (itemNode) {
        const itemBounds = itemNode.getBoundingClientRect();
        if (event.clientX >= itemBounds.left && event.clientX <= itemBounds.right &&
            event.clientY >= itemBounds.top && event.clientY <= itemBounds.bottom) {
            return;
        }
    }

    emit("click-outside");
};

const calendarHeaderBottom = ref(null as number | null);

const getCalendarHeaderBottom = () => {
    // this should not normally change so can be calculated once
    if (calendarHeaderBottom.value === null) {
        const headerNode = document.getElementById("calendar-header");
        if (!headerNode) {
            return 0;
        }
        calendarHeaderBottom.value = headerNode.getBoundingClientRect().bottom;
    }
    return calendarHeaderBottom.value;
};

const calculatePosition = () => {
    const itemNode = getItemNode();
    if (!itemNode) {
        return position.value;
    }

    const minY = getCalendarHeaderBottom();

    // this calculates the position of the popover
    // and handles cases when it goes out of bounds due to scrolling of the main container
    let y, x;
    if (props.placement === "top") {
        y = itemNode.getBoundingClientRect().top;
        x = itemNode.getBoundingClientRect().right - (itemNode.clientWidth / 2);
        // if popover is on top of the item and is too high up (out of visible part of the scroll container),
        // then limit it to the top of the calendar.
        // this will keep the popover sticking to the item as it gets scrolled away.
        // once the item gets completely scrolled out of view,
        // the popover will close automatically, because this is used for item hints which close on mouseleave
        if (y < minY) {
            y = minY;
        }
    } else {
        y = itemNode.getBoundingClientRect().top + itemNode.clientHeight;
        x = itemNode.getBoundingClientRect().right;

        if (y < minY) {
            // if popover is on the bottom of the box and is too high, emit that it's out of bounds.
            // this is used for item menus which need to be explicitly closed,
            // since the item scrolling out of view will not automatically trigger closing on mouseleave
            emit("scroll-out-of-boundds");
        } else {
            // also, if the popover is too low (below the bottom of the viewport)
            // it should be adjusted to stay in the viewport as long as a part of the item is still visible,
            // and should be closed in case the item fully disappears
            const maxY = window.innerHeight;
            if (y > maxY) {
                if (itemNode.getBoundingClientRect().top < maxY) {
                    y = maxY;
                } else {
                    emit("scroll-out-of-boundds");
                }
            }
        }
    }
    return {
        x,
        y
    };
};

watch(shouldShowPopover, (show) => {
    if (show) {
        updatePosition();
    }
}, { immediate: true });

watch(item, () => {
    updatePosition();
}, { deep: true });

const { height: windowHeight, width: windowWidth } = useWindowSize({ includeScrollbar: true, type: "inner" });
watch([windowHeight, windowWidth], () => {
    updatePosition();
});

defineExpose({
    updatePosition
});

</script>
<style scoped lang="scss"></style>
<style lang="scss">
// these are global styles
.n-popover.orders-calendar-item-popover {

    border-radius: $element-border-radius-small;
    @include dialog-shadow;

    &,
    .n-popover-arrow-wrapper .n-popover-arrow {
        background-color: $color-background-lightest;
        border: 1px solid $color-border-normal;
    }
}
</style>
