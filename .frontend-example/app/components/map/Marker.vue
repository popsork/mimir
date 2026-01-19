<template>
    <span>
        <svg width="34" height="48" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M34 17.4545C34 27.0944 17 48 17 48C17 48 0 27.0944 0 17.4545C0 7.81467 7.61116 0 17 0C26.3888 0 34 7.81467 34 17.4545Z"
                :fill="color"
            />
            <rect x="5" y="5" width="24" height="24" rx="12" fill="white" />
            <text x="13" y="22" style="">{{ label }}</text>
        </svg>
    </span>
</template>
<script setup lang="ts">

defineProps<{
    color: string,
    label: string,
}>();

</script>
<style scoped lang="scss">
svg {
    text {
        font-family: $font-stack;
        @include large-medium-text;
        color: $color-text-lighter;
    }
}
</style>
