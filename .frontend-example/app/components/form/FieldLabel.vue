<template lang="pug">
span.label(:title="text")
    | {{ text }}
    span.secondary(v-if="secondaryText") {{ secondaryText }}
</template>
<script setup lang="ts">

defineProps<{
    text: string,
    secondaryText?: string,
}>();

</script>
<style scoped lang="scss">
.label {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-bottom: 2px;
    color: $color-text-lightest;

    @include word-clip;


}
</style>
