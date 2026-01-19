<template lang="pug">
FormDateField(
    v-model="departureRange"
    :changed="currentValueIsManual"
    name="departure"
    type="datetimerange"
    :label="$t('transport_orders.fields.Departure')"
    layout="compact"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { recalculateOrder } = useOrderFormStore();

const departureStart = computed<string | null>({
    get: () => {
        return getTransportOrder()?.departureStart ?? null;
    },
    set: (value: string | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }
        order.departureStart = value;
        order.departureStartIsManual = true;
    }
});

const departureEnd = computed<string | null>({
    get: () => {
        return getTransportOrder()?.departureEnd ?? null;
    },
    set: (value: string | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }

        order.departureEnd = value;
        order.departureEndIsManual = true;
    }
});

const departureRange = computed<[string, string] | null>({
    get: () => {
        if (!departureStart.value || !departureEnd.value) {
            return null;
        }
        return [
            departureStart.value,
            departureEnd.value
        ] as [string, string];
    },
    set: (values: [string, string] | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }

        const start = (values && values[0]) ? values[0] : null;
        const end = (values && values[1]) ? values[1] : null;

        order.departureStart = start;
        order.departureStartIsManual = true;
        order.departureEnd = end;
        order.departureEndIsManual = true;
    }
});

const currentValueIsManual = computed(() => {
    const order = getTransportOrder();
    if (!order) {
        return;
    }
    // currently, if any of the range endpoints is manual, the whole range is displayed as manual.
    // if this needs altering later, then support for that needs to be added in FormDateField
    return order.departureStartIsManual || order.departureEndIsManual;
});


const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    fields: ["pickup_earliest_at", "pickup_latest_at"]
});


</script>
<style scoped lang="scss"></style>
