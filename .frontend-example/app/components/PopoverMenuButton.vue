<template lang="pug">
component(
    :is="tag"
    :type="buttonType"
    :class="classNames"
    :to="props.to"
    :disabled="isDisabledOrWaiting ? true : null"
    class="button"
)
    span.label {{ text }}
    WaitingIndicator(v-if="isWaiting")
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from "#vue-router";

const props = withDefaults(defineProps<{
    text: string,
    highlight?: boolean,
    waiting?: boolean,
    disabled?: boolean,
    to?: RouteLocationRaw,
}>(), {
    highlight: false,
    waiting: false,
});

const isLink = computed(() => {
    return !!props.to;
});

const tag = computed(() => {
    return (isLink.value) ? resolveComponent("NuxtLink") : "button";
});

const buttonType = computed(() => {
    return (tag.value === "button") ? "button" : null;
});

const classNames = computed(() => {
    const classes = [] as string[];

    if (props.highlight) {
        classes.push("highlight");
    }

    if (isWaiting.value) {
        classes.push("waiting");
    }

    if (isDisabled.value) {
        classes.push("disabled");
    }

    return classes;
});

const isWaiting = computed(() => {
    return !!props.waiting;
});

const isDisabled = computed(() => {
    return !!props.disabled;
});

const isDisabledOrWaiting = computed(() => {
    return isDisabled.value || isWaiting.value;
});

</script>
<style scoped lang="scss">
.button {
    position: relative;
    display: flex;
    padding: steps(0.5) steps(1.5);
    width: 100%;
    height: steps(4);
    border-radius: $element-border-radius-small;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    background-color: $color-background-lightest;
    color: $color-text-normal;

    @include clickable-button;
    @include normal-medium-text;

    &[disabled] {
        color: $color-text-disabled;
    }

    &:hover:not([disabled]) {
        background-color: $color-background-light;
    }

    &.highlight:not([disabled]) {
        color: $color-text-highlight;
    }

    &.waiting {
        .label {
            opacity: 0;
        }
    }

    .waiting-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        color: $color-text-normal;

        position: absolute;
        inset: 0;

        :deep(.icon) {
            height: steps(2.5);
            width: steps(2.5);
        }
    }
}
</style>
