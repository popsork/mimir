<template lang="pug">
div.no-items-message
    slot
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.no-items-message {
    display: flex;
    flex-direction: column;
    gap: steps(1);

    padding-top: steps(3);
    padding-bottom: steps(3);
    border-radius: $element-border-radius;

    background-color: $color-background-lightest;
    color: $color-text-lightest;
    text-align: center;

    @include normal-text;

    pointer-events: none; // important for these messages to work inside the sortable lists

}
</style>
