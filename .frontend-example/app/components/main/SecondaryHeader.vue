<template lang="pug">
.secondary-header(ref="header")
    slot
</template>
<script setup lang="ts">

useElementHeightTracking("secondaryPageHeader", useTemplateRef("header"));

</script>
<style scoped lang="scss">
.secondary-header {
    display: flex;
    height: steps(5);
    @include content-padding;

    background-color: $color-background-light;
    align-items: center;
}
</style>
