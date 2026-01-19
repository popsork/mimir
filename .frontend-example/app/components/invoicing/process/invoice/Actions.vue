<template lang="pug">
.actions
    GenericButton(
        type="primary"
        size="large"
        icon="arrow-down"
        :disabled="true"
    ) {{ $t("invoicing.process.invoice.actions.Download PDF") }}
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.actions {
    display: flex;
    justify-content: flex-end;
}
</style>
