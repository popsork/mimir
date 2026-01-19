<template lang="pug">
.item(:data-name="name")
    dt {{ props.label }}
    dd {{ text }}
</template>
<script setup lang="ts">
const props = defineProps<{
    label: string,
    value: number | string | null,
    name?: string,
}>();

const text = computed(() => {
    return (props.value === null || props.value === "") ? getBlankValueLabelText() : props.value;
});

</script>
<style scoped lang="scss">
.item {
    // the block-list mixin does not reach here because the items are scoped in a different component than the list itself
    &,
    dt,
    dd {
        display: block;
        margin: 0;
        padding: 0;
    }

    dt {
        @include tiny-medium-text;
        color: $color-text-lightest;
        margin-bottom: steps(0.5);
    }
    dd {
        @include small-text;
    }
}
</style>
