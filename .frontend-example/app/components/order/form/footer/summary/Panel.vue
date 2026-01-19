<template lang="pug">
.summary-panel(:data-state="state")
    h4.title {{ title }}
    slot
</template>
<script setup lang="ts">

defineProps<{
    state: "normal" | "warning",
    title: string,
}>();

</script>
<style scoped lang="scss">
.summary-panel {
    display: flex;
    height: steps(4);
    padding: 0 steps(2);
    align-items: center;
    gap: steps(4);

    border-radius: $element-border-radius;

    &[data-state="normal"] {
        background-color: $color-background-light;
    }

    &[data-state="warning"] {
        background-color: $color-background-danger;
    }

    .title {
        flex: 0 0 steps(10);
        @include normal-medium-text;
    }
}
</style>
