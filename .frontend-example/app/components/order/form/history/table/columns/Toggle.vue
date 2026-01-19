<template lang="pug">
td(data-name="toggle")
    GenericExpansionSwitch(v-model="expanded")
</template>
<script setup lang="ts">

const expanded = defineModel<boolean>("expanded");

</script>
<style scoped lang="scss"></style>
