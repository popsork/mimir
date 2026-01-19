<template lang="pug">
OrderFormHeaderFieldset(:title="$t('order.fieldsets.Requirements')" name="requirements")
    .fields
        OrderFormHeaderFieldsPlannedPickupAt
        OrderFormHeaderFieldsPlannedDeliveryAt
        OrderFormHeaderFieldsOperation
        OrderFormHeaderFieldsService
        OrderFormHeaderFieldsCargoType
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
fieldset {
    .fields {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: steps(1) steps(2);
        align-items: start;

        .field[data-type="checkbox"] {
            margin-top: steps(2);
        }
    }
}
</style>
