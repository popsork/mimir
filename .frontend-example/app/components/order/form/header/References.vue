<template lang="pug">
OrderFormHeaderFieldset(:title="$t('order.fieldsets.References')" name="references")
    .fields
        OrderFormHeaderFieldsWaybillNumber
        OrderFormHeaderFieldsReferences
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
fieldset {
    :deep(.field) {
        margin-bottom: steps(1);
    }
}
</style>
