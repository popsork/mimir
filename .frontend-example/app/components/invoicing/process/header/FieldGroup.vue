<template lang="pug">
.field-group(:data-name="name")
    slot
</template>
<script setup lang="ts">

defineProps<{
    name: string,
}>();

</script>
<style scoped lang="scss">
.field-group {
    display: flex;
    border-bottom: 1px solid $color-border-normal;
    margin-bottom: steps(0.5);
}
</style>
