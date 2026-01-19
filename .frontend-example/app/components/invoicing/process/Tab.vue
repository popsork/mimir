<template lang="pug">
GenericRouteTab(:name="name")
    template(v-slot:title)
        slot(name="title")
</template>
<script setup lang="ts">

defineProps<{
    name: InvoicingProcessTabName,
}>();

</script>
<style scoped lang="scss"></style>
