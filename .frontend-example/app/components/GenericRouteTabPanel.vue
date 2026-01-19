<template lang="pug">
component(:is="tag" class="tab-panel" :data-name="name")
    slot
</template>
<script setup lang="ts">

defineProps<{
    tag: "section" | "fieldset",
    name: string,
}>();

</script>
<style scoped lang="scss">
.tab-panel {
    padding: steps(1.5);

    border-radius: $element-border-radius;
    background: $color-background-lighter;

}
</style>
