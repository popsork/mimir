<template lang="pug">
section(:data-name="name")
    h2.title {{ title }}
    slot
</template>
<script setup lang="ts">

defineProps<{
    title: string,
    name: string,
}>();

</script>
<style scoped lang="scss">
section {
    padding: steps(1.5) steps(1.5) steps(1);

    background: $color-background-lighter;

    border-radius: $element-border-radius;

    .title {
        @include normal-medium-text;
        margin-bottom: steps(1);
    }
}
</style>
