<template lang="pug">
section
    h2.title {{ title }}
    slot
</template>
<script setup lang="ts">

defineProps<{
    title: string,
}>();

</script>
<style scoped lang="scss">
section {
    h2.title {
        @include normal-heading;
    }
}
</style>
