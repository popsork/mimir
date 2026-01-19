<template lang="pug">
FormDateField(
    v-model="plannedPickupAt"
    :changed="order.plannedPickupAtIsManual"
    name="planned_pickup_at"
    type="datetime"
    :label="$t('order.fields.Planned pickup')"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const plannedPickupAt = computed({
    get: () => order.value.plannedPickupAt,
    set: (value: string | null) => {
        order.value.plannedPickupAt = value;
        order.value.plannedPickupAtIsManual = true;
    }
});

const { recalculateOrder } = useOrderFormStore();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "planned_pickup_at",
});

</script>
<style scoped lang="scss"></style>
