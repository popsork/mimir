<template lang="pug">
GenericRouteTabPanel(tag="fieldset" :name="name")
    slot
</template>
<script setup lang="ts">

defineProps<{
    name: string,
}>();

</script>
<style scoped lang="scss"></style>
