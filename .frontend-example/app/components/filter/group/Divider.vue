<template lang="pug">
.divider
    span.text
        slot
</template>
<script setup lang="ts">
</script>
<style scoped lang="scss">
.divider {
    margin-top: steps(3);
    margin-bottom: steps(3);
    background-color: $color-background-darker;
    height: 1px;
    position: relative;

    .text {
        background-color: $color-background-lighter;
        @include body-small-strong-text;
        color: $color-text-lightest;
        display: inline-block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 0 steps(1.5);
        text-transform: uppercase;
    }
}
</style>
