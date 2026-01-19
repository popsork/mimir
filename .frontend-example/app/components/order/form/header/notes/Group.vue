<template lang="pug">
.group(:data-name="name")
    slot
</template>
<script setup lang="ts">

defineProps<{
    name: string,
}>();

</script>
<style scoped lang="scss">
.group {
    display: flex;
    flex-direction: column;
    gap: steps(1);

    // add padding so that textarea's focus shadow does not get cut off at the sides due to hidden overflow
    margin: 0 -2px;
    padding: 0 2px;
}
</style>
