<template lang="pug">
.button-group
    slot
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.button-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: steps(0.5);

    height: steps(3.5);
    background: $color-background-lightest;

    border: 1px solid $color-border-normal;
    border-radius: steps(4);
    padding: 1px;
}
</style>
