<template lang="pug">
p.error(v-if="message" :data-size="size") {{ message }}
</template>
<script setup lang="ts">
withDefaults(defineProps<{
    message: string,
    size?: "small" | "medium",
}>(), {
    size: "medium"
});
</script>
<style scoped lang="scss">
.error {
    @include normal-text;
    color: $color-text-error;
    @include word-break; // prevent breaking of form layouts if error messages contain long uninterrupted substrings

    &[data-size="small"] {
        @include small-text;
    }
}
</style>
