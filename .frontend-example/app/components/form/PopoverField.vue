<template lang="pug">
.field(:data-name="name" data-type="popover" :data-layout="layout" :title="title")
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    NPopover(
        ref="popover"
        class="popover-field"
        :placement="props.placement"
        trigger="manual"
        :raw="true"
        :on-clickoutside="handleOutsideClick"
        :show-arrow="props.showArrow"
    )
        template(v-slot:trigger)
            button.trigger(
                ref="trigger"
                type="button"
                :title="title"
                :class="triggerClasses"
                v-on:click.stop="handleTriggerClick"
            )
                template(v-if="slots.trigger")
                    slot(name="trigger")
                template(v-else)
                    span {{ value }}

        template(v-if="slots.popover")
            slot(name="popover")
    FormErrors(:errors="errors")
</template>
<script setup lang="ts">
import { NPopover } from "naive-ui"; // explicit import needed for typescript during build

// layouts:
// loose - labels above
// compact - labels inside (called "combined" in figma)

// currently, this field does not have a size prop,
// and is always displayed in a way that matches medium size variant in other fields

const props = withDefaults(defineProps<{
    name?: string,
    label?: string,
    labelVisible?: boolean,
    layout?: "loose" | "compact",
    value?: string | null | undefined,
    changed?: boolean,
    placement?: "bottom" | "bottom-start",
    showArrow?: boolean,
    errors?: FormFieldError[],
}>(), {
    labelVisible: true,
    layout: "loose",
    changed: false,
    placement: "bottom",
});

const slots = useSlots();

const isLabelVisible = computed(() => props.labelVisible);

const title = computed(() => {
    return (props.label && !isLabelVisible.value) ? props.label : undefined;
});

const isActive = ref(false);

const triggerClasses = computed(() => {
    const classes = [] as string[];
    if (isActive.value) {
        classes.push("active");
    }
    if (slots.trigger) {
        classes.push("raw");
    }
    if (props.changed) {
        classes.push("changed");
    }
    return classes;
});

const popover = useTemplateRef("popover");

const updatePopoverState = () => {
    if (popover.value) {
        popover.value.setShow(isActive.value);
    }
};

const emit = defineEmits<{
    (e: "open"): void,
    (e: "close"): void,
}>();

const open = () => {
    isActive.value = true;
    updatePopoverState();
};

const openAndEmit = () => {
    open();
    emit("open");
};

const close = () => {
    isActive.value = false;
    updatePopoverState();
};

const closeAndEmit = () => {
    close();
    emit("close");
};

const handleTriggerClick = () => {
    // using trigger="manual" to fully control opening and closing,
    // because naive-ui's built in trigger="click" was not working consistently when used along with other ways of closing,
    // e.g. on-update:show was not called when closing the popover via setShow
    if (isActive.value) {
        closeAndEmit();
    } else {
        openAndEmit();
    }
};

const trigger = useTemplateRef("trigger");

const handleOutsideClick = (event: MouseEvent) => {
    if (!event.target) {
        return;
    }
    if (trigger.value && trigger.value.contains(event.target as Node)) {
        return;
    }

    closeAndEmit();
};

useCallbackOnEscape(() => {
    closeAndEmit();
});

defineExpose({
    open,
    close
});

</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    .label {
        @include small-text;
    }

    .trigger {
        display: block;
        width: 100%;
        height: steps(3);

        border-radius: $element-border-radius-smallest;
        text-align: left;
        @include outline-when-active;

        &:not(.raw) {

            // default trigger looks like an input field
            background: $color-background-lightest;
            color: $color-text-lighter;
            padding: 0 6px;
            border: 1px solid $color-border-darker;
            @include word-clip;
            @include normal-text;

            &:hover {
                border: 1px solid $color-border-hover;
            }

            &:focus,
            &:active,
            &.active {
                border: 1px solid $color-border-dark;
            }

            &.changed {
                color: $color-text-changed;
            }

        }
    }

    &[data-layout="compact"] {
        .label {
            @include tiny-medium-text;
            position: absolute;
            z-index: 1; // any positive z-index to put it above the input
            top: 1px;
            left: 6px;
            right: 6px;
            width: auto;
            padding: 3px steps(1) steps(0.5) 0;
            pointer-events: none;
        }

        .trigger:not(.raw) {
            height: steps(3.5);
            border-radius: $element-border-radius-smaller;
            @include small-medium-text;
            padding-top: 11px;
        }
    }

}
</style>
<style lang="scss">
// these are global styles
.n-popover.popover-field {

    background: $color-background-lightest;
    border-radius: $dialog-border-radius;
    min-width: 0;
    padding: steps(2);
    @include dialog-shadow;

    &,
    .n-popover-arrow-wrapper .n-popover-arrow {
        background-color: $color-background-lightest;
        border: none;
    }

}
</style>
