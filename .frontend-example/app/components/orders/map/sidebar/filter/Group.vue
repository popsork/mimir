<template lang="pug">
.group
    h3.title {{ props.title }}
    slot
</template>
<script setup lang="ts">
const props = defineProps<{
    title: string,
}>();
</script>
<style scoped lang="scss">
.group {
    border-top: 1px solid $color-border-normal;
    margin: steps(3) 0 0;

    .title {
        @include normal-medium-text;
        padding: steps(1) 0;
        line-height: steps(2.5);
    }
}
</style>
