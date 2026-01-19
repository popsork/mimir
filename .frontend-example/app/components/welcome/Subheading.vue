<template lang="pug">
h2.subheading {{ text }}
</template>
<script setup lang="ts">
defineProps<{
    text: string,
}>();
</script>
<style scoped lang="scss">
h2 {
    @include large-medium-text;
    text-align: center;
    padding: steps(2) 0;
}
</style>
