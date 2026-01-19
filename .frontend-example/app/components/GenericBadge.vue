<template lang="pug">
span.badge(v-bind="badgeProps")
    span.text {{ text }}
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
    text: string,
    size?: "small" | "medium" | "large",
    color?: string,
    textColor?: string,
    borderColor?: string,
}>(), {
    size: "medium",
    color: "#EEEEF0", // $color-background-light
    textColor: "#373B43", // $color-text-lighter
});

const badgeProps = computed(() => {
    const styleParts = [] as string[];

    if (props.color) {
        styleParts.push(`background-color: ${props.color}`);
    }

    if (props.textColor) {
        styleParts.push(`color: ${props.textColor}`);
    }

    if (props.borderColor) {
        styleParts.push(`border-color: ${props.borderColor}`);
    }

    return {
        "data-size": props.size,
        "class": props.borderColor ? "has-border" : null,
        style: (styleParts.length > 0) ? styleParts.join("; ") : undefined
    };
});

</script>
<style scoped lang="scss">
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    &[data-size="small"] {
        height: steps(2);
        padding: 0 6px;
        border-radius: steps(2);
        @include small-medium-text;
    }

    &[data-size="medium"] {
        height: steps(2.5);
        padding: 0 steps(1);
        border-radius: steps(2.5);
        @include normal-text;
    }

    &[data-size="large"] {
        height: steps(3);
        padding: 0 steps(1.5);
        border-radius: steps(3);
        @include normal-text;
    }


    &.has-border {
        border-width: 1px;
        border-style: solid;
    }

}
</style>
