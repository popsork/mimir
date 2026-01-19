<template lang="pug">
.header
    h4.heading {{ heading }}
    slot
</template>
<script setup lang="ts">
defineProps<{
    heading: string,
}>();
</script>
<style scoped lang="scss">
.header {
    display: flex;
    height: steps(3.5);
    justify-content: space-between;
    align-items: center;
    @include content-padding;
    background-color: $color-background-light;

    .heading {
        @include normal-medium-text;
    }

}
</style>
