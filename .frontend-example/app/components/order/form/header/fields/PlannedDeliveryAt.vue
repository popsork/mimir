<template lang="pug">
FormDateField(
    v-model="plannedDeliveryAt"
    :changed="order.plannedDeliveryAtIsManual"
    name="planned_delivery_at"
    type="datetime"
    :label="$t('order.fields.Planned delivery')"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const plannedDeliveryAt = computed({
    get: () => order.value.plannedDeliveryAt,
    set: (value: string | null) => {
        order.value.plannedDeliveryAt = value;
        order.value.plannedDeliveryAtIsManual = true;
    }
});

const { recalculateOrder } = useOrderFormStore();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "planned_delivery_at",
});

</script>
<style scoped lang="scss"></style>
