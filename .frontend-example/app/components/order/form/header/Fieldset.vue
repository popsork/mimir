<template lang="pug">
fieldset(:data-name="name")
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
fieldset {
    padding: steps(1.5);

    background: $color-background-lighter;

    border-radius: $element-border-radius;

    .title {
        @include normal-medium-text;
        margin-bottom: steps(1);
    }
}
</style>
