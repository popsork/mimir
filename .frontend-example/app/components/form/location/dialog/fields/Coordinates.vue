<template lang="pug">
.field(data-name="coordinates")
    FormLocationDialogFieldsLatitude
    FormLocationDialogFieldsLongitude
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.field[data-name="coordinates"] {
    display: flex;
    gap: steps(2);
}
</style>
