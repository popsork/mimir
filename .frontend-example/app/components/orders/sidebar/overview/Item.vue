<template lang="pug">
.item(:data-name="name" :class="classes")
    dt {{ props.label }}
    dd(:title="title") {{ text }}
</template>
<script setup lang="ts">

export type OrdersSidebarOverviewSectionItem = {
    name?: string,
    label?: string,
    labelVisible?: boolean,
    multiline?: boolean,
    value: string | null,
};

const props = withDefaults(defineProps<{
    label?: string,
    value: string | null,
    name?: string,
    labelVisible?: boolean,
    multiline?: boolean,
}>(), {
    labelVisible: true,
    multiline: false
});

const text = computed(() => {
    return (props.value === null || props.value === "") ? getBlankValueLabelText() : props.value;
});

const title = computed(() => {
    if (props.multiline) {
        return undefined;
    }
    return props.value ?? undefined;
});

const classes = computed(() => {
    return {
        "hidden-label": !shouldShowLabel.value,
        multiline: props.multiline,
    };
});

const shouldShowLabel = computed(() => {
    return props.labelVisible !== false;
});




</script>
<style scoped lang="scss">
.item {
    display: flex;
    gap: steps(1);

    // the block-list mixin does not reach here because the items are scoped in a different component than the list itself
    &,
    dt,
    dd {
        margin: 0;
        padding: 0;
    }

    &:not(.multiline) {
        &,
        dd {
            @include word-clip;
        }
    }

    dt {
        @include normal-medium-text;
        color: $color-text-normal;
        white-space: nowrap;
    }

    dd {
        @include normal-text;
        color: $color-text-lightest;
        @include word-break;
    }

    &.hidden-label dt {
        @include visually-hidden;
    }
}
</style>
