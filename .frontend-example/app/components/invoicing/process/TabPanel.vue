<template lang="pug">
GenericRouteTabPanel(tag="section" :name="name")
    slot
</template>
<script setup lang="ts">

defineProps<{
    name: string,
}>();

</script>
<style scoped lang="scss"></style>
