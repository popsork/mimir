<template lang="pug">
.controllers
    button.increment(
        type="button"
        :title="$t('orders.map.filters.Date.Increment')"
        :disabled="!incrementEnabled"
        v-on:click="$emit('increment')"
    )
        SvgImage(name="caret-up" class="icon")
    button.decrement(
        type="button"
        :title="$t('orders.map.filters.Date.Decrement')"
        :disabled="!decrementEnabled"
        v-on:click="$emit('decrement')"
    )
        SvgImage(name="caret-down" class="icon")
</template>
<script setup lang="ts">

defineProps<{
    incrementEnabled: boolean,
    decrementEnabled: boolean,
}>();

defineEmits<{
    (e: "increment"): void,
    (e: "decrement"): void,
}>();


</script>
<style scoped lang="scss">
.controllers {
    display: flex;
    flex-direction: column;

    .increment,
    .decrement {
        @include clickable-button;

        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        width: steps(2);
        border-radius: steps(2);

        color: $color-text-lightest;

        &:hover {
            color: $color-text-normal;
        }

        &[disabled] {
            @include disabled-button;
            color: $color-text-disabled;
        }

        :deep(.icon) {
            &,
            > svg {
                width: calc(steps(1) + 4px);
                height: calc(steps(1) + 4px);
                padding: 0;
            }
        }
    }
}
</style>
