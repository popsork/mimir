<template lang="pug">
button.today-button(type="button" v-bind="buttonProps" :title="$t('orders.map.filters.Date.Today')") {{ $t('orders.map.filters.Date.Today') }}
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    selected?: boolean,
}>(), {
    selected: false
});

const buttonProps = computed(() => ({
    class: {
        selected: props.selected,
    },
}));
</script>
<style scoped lang="scss">
.today-button {
    @include clickable-button;
    @include normal-medium-text;

    background: $color-background-lightest;
    color: $color-text-lighter;

    height: steps(3);
    border-radius: steps(3);
    padding: 0 steps(3);

    display: flex;
    align-items: center;
    justify-content: center;

    @include transition;
    &.selected,
    &:active {
        background: $color-background-light;
    }
    &:hover {
        background: $color-background-darker;
    }

}
</style>
