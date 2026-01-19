<template lang="pug">
NPopover(
    ref="popover"
    :trigger="props.trigger"
    :placement="props.placement"
    :show="show"
    :show-arrow="props.showArrow"
    :on-clickoutside="props.onClickoutside"
    :x="props.x"
    :y="props.y"
    raw
    class="popover-menu"
)
    template(v-if="slots.trigger" v-slot:trigger)
        slot(name="trigger")
    slot
</template>
<script setup lang="ts">
import { NPopover } from "naive-ui"; // explicit import needed for typescript during build
type MouseEventCallback = (e: MouseEvent) => void;
type PopoverMenuTrigger = "click" | "manual";
type PopoverMenuPlacement = "top" | "bottom" | "left" | "right" | "bottom-end" | "bottom-start";

const props = withDefaults(defineProps<{
    trigger?: PopoverMenuTrigger,
    placement?: PopoverMenuPlacement,
    showArrow?: boolean | undefined,
    onClickoutside?: MouseEventCallback,
    show?: boolean,
    x?: number,
    y?: number,
}>(), {
    show: undefined,
    showArrow: undefined,
});

const popover = useTemplateRef("popover");
const slots = useSlots();

defineExpose({
    show: () => {
        popover.value?.setShow(true);
    },

    hide: () => {
        popover.value?.setShow(false);
    }
});

</script>
<style scoped lang="scss"></style>
<style lang="scss">
// these are global styles
.n-popover.popover-menu {
    padding: 3px;
    border-radius: $element-border-radius;
    @include dialog-shadow;

    &,
    .n-popover-arrow-wrapper .n-popover-arrow {
        background-color: $color-background-lightest;
        border: 1px solid $color-border-normal;
    }
}
</style>
