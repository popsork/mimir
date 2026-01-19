<template lang="pug">
button.group-button(type="button" v-bind="buttonProps" :title="title")
    template(v-if="props.icon")
        SvgImage(:name="props.icon")
    template(v-if="slots.default")
        slot
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
    selected?: boolean,
    icon?: string,
    title?: string,
}>(), {
    selected: false
});

const slots = useSlots();

const isIconOnly = computed(() => {
    return !slots.default && props.icon;
});

if (isIconOnly.value && props.title === undefined) {
    console.error(`Icon-only buttons require a title. (Icon: ${props.icon})`);
}

const buttonProps = computed(() => ({
    class: {
        selected: props.selected,
        "icon-only": isIconOnly.value
    }
}));

</script>
<style scoped lang="scss">
.group-button {

    @include clickable-button;
    @include normal-medium-text;

    background: $color-background-lightest;
    color: $color-text-lighter;

    height: steps(3);
    border-radius: steps(3);
    padding: 0 steps(1.5);

    display: flex;
    align-items: center;
    justify-content: center;

    &.icon-only {
        padding-left: steps(0.5);
        padding-right: steps(0.5);
    }

    @include transition;
    &.selected,
    &:hover {
        background: $color-background-light;
    }

}
</style>
