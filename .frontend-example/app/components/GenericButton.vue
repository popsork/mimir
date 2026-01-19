<template lang="pug">
component(
    :is="tag"
    :id="id"
    ref="button"
    :class="classNames"
    :type="buttonType"
    :to="to"
    :title="title"
    :external="isExternal"
    :disabled="isDisabledOrWaiting"
    :data-name="name"
    :data-type="type"
    :data-size="size"
    :data-icon-placement="(icon && !isIconOnly ? iconPlacement : null)"
    v-on:click="blurIfLink"
)
    .content
        SvgImage(v-if="icon && ((iconPlacement === 'before') || isIconOnly)" class="icon" :name="icon")
        span.text(v-if="slots.default")
            slot
        SvgImage(v-if="icon && iconPlacement === 'after' && !isIconOnly" class="icon" :name="icon")
    WaitingIndicator(v-if="isWaiting")

</template>
<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import type { NuxtLink } from "#components";

export type GenericButtonType =
    "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "ghost"
    | "alternative-ghost"
    | "alternative"
    | "dangerous"
    | "dangerous-ghost";
export type GenericButtonSize = "small" | "medium" | "large";

const props = withDefaults(defineProps<{
    type?: GenericButtonType,
    size?: GenericButtonSize,
    buttonType?: "button" | "submit",
    to?: RouteLocationRaw,
    disabled?: boolean,
    name?: string,
    id?: string,
    icon?: string,
    iconPlacement?: "before" | "after",
    title?: string,
    waitingFor?: WaitingFor, // auto-wait based on a defined waiter in the store
    waiting?: boolean, // or manually accept waiting state for more complex cases,
    external?: boolean, // for NuxtLink
}>(), {
    type: "primary",
    size: "medium",
    buttonType: "button",
    iconPlacement: "after",
    waiting: false,
    external: false,
});


const isLink = computed(() => {
    return !!props.to;
});

const tag = computed(() => {
    return (isLink.value) ? resolveComponent("NuxtLink") : "button";
});

const buttonType = computed(() => {
    return (tag.value === "button") ? (props.buttonType ?? "button") : null;
});


const classNames = computed(() => {
    const classes = ["button"];

    if (isWaiting.value) {
        classes.push("waiting");
    }

    if (isDisabled.value) {
        classes.push("disabled");
    }

    if (props.icon) {
        classes.push("has-icon");
    }

    if (isIconOnly.value) {
        classes.push("icon-only");
    }

    return classes;
});


const waitStore = useWaitStore();
const isWaiting = computed(() => {
    if (props.waiting) {
        return true;
    }

    if (!props.waitingFor) {
        return false;
    }
    return waitStore.is(props.waitingFor);
});

const isDisabled = computed(() => {
    if (tag.value !== "button") {
        return false;
    }

    return !!props.disabled;
});

const isDisabledOrWaiting = computed(() => {
    return isDisabled.value || isWaiting.value;
});

const isExternal = computed(() => {
    if (tag.value === "button") {
        return null;
    }
    return props.external;
});


const slots = useSlots();

const icon = computed(() => {
    return props.icon;
});

const isIconOnly = computed(() => {
    return !slots.default && icon.value;
});

if (isIconOnly.value && props.title === undefined) {
    console.error(`Icon-only buttons require a title. (Icon: ${props.icon})`);
}


type LinkComponent = InstanceType<typeof NuxtLink>;
type ButtonComponent = InstanceType<typeof HTMLButtonElement>;

const button = useTemplateRef<LinkComponent | ButtonComponent>("button");

const buttonNode = computed(() => {
    if (!button.value) {
        return null;
    }
    return (isLink.value) ? (button.value as LinkComponent).$el : button.value;
});

const focus = (): void => {
    if (!buttonNode.value) {
        return;
    }
    buttonNode.value.focus();
};

const blur = (): void => {
    if (!buttonNode.value) {
        return;
    }
    buttonNode.value.blur();
};

const blurIfLink = () => {
    // unfocus the button element after clicking if it is a link,
    // so that after route navigation the button does not remain marked with an outline
    if (!isLink.value) {
        return;
    }
    blur();
};


defineExpose({
    focus,
    blur
});

</script>
<style scoped lang="scss">
.button {
    @include button-shape;

    .content,
    .waiting-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .waiting-indicator {
        position: absolute;
        inset: 0;
    }

    &.waiting {
        .content {
            opacity: 0;
        }
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px $color-outline-accent;
    }


    &.disabled {
        cursor: not-allowed;
    }

    &[data-type="primary"] {
        &,
        &:focus {
            background: $color-background-inverted-highlight;
            color: $color-text-inverted;
        }

        &:hover,
        &:active {
            background: $color-background-inverted-highlight-darker;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
        }
    }

    &[data-type="secondary"] {
        &,
        &:focus {
            background: transparent;
            border: 1px solid $color-border-highlight;
            color: $color-text-highlight;
        }

        &:hover,
        &:active {
            background: $color-background-accent;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
            border: 1px solid $color-border-normal;
        }
    }

    &[data-type="tertiary"] {
        &,
        &:focus {
            background: $color-background-lightest;
            color: $color-text-highlight;
        }

        &:hover,
        &:active {
            background: $color-background-accent;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
            border: 1px solid $color-border-normal;
        }
    }

    &[data-type="quaternary"] {
        &,
        &:focus {
            background: $color-background-light;
            color: $color-text-lighter;
        }

        &:hover,
        &:active {
            background: $color-background-darker;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
            border: 1px solid $color-border-normal;
        }
    }

    &[data-type="ghost"] {
        &,
        &:focus {
            background: transparent;
            color: $color-text-highlight;
        }

        &:hover,
        &:active {
            background: $color-background-light;
        }

        &.disabled {
            background: transparent;
            color: $color-text-disabled;
        }
    }

    &[data-type="alternative-ghost"] {
        &,
        &:focus {
            background: transparent;
            color: $color-text-lighter;
        }

        &:hover,
        &:active {
            background: $color-background-light;
        }

        &.disabled {
            background: transparent;
            color: $color-text-disabled;
        }
    }

    &[data-type="alternative"] {
        &,
        &:focus {
            background: $color-background-inverted-darker;
            color: $color-text-inverted;
        }

        &:hover,
        &:active {
            background: $color-background-inverted-dark;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
        }
    }

    &[data-type="dangerous"] {
        &,
        &:focus {
            background: $color-danger;
            color: $color-text-inverted;
        }

        &:hover,
        &:active {
            background: $color-danger-darker;
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
        }
    }

    &[data-type="dangerous-ghost"] {
        &,
        &:focus {
            background: transparent;
            color: $color-danger;
        }

        &:hover,
        &:active {
            background: $color-background-light;
        }

        &.disabled {
            background: transparent;
            color: $color-text-disabled;
        }
    }


    &[data-size="large"] {
        @include normal-medium-text;

        height: steps(4.5);

        &.icon-only {

            &,
            .content {
                width: steps(4.5);
                flex: 0 0 steps(4.5);
            }
        }

        &:not(.icon-only) {
            padding: 0 steps(2);
        }

        .content {
            gap: steps(1);
        }

        :deep(.icon) {
            &,
            > svg {
                width: steps(2);
                height: steps(2);
            }
        }

    }

    &[data-size="medium"] {
        @include normal-medium-text;

        height: steps(4);

        &.icon-only {
            width: steps(4);
            flex: 0 0 steps(4);
        }

        &:not(.icon-only) {
            padding: 0 steps(1.5);
        }

        .content {
            gap: steps(0.5);
        }

        :deep(.icon) {
            &,
            > svg {
                width: steps(2);
                height: steps(2);
            }
        }
    }

    &[data-size="small"] {
        @include normal-medium-text;

        height: steps(3);

        &.icon-only {
            width: steps(3);
            flex: 0 0 steps(3);
        }


        &:not(.icon-only) {
            padding: 0 10px;
        }

        .content {
            gap: steps(0.5);
        }

        :deep(.icon) {
            &,
            > svg {
                width: steps(2);
                height: steps(2);
            }
        }

        &.icon-only {

            :deep(.icon) {
                &,
                > svg {
                    width: steps(2.5);
                    height: steps(2.5);
                }
            }
        }
    }

}
</style>
