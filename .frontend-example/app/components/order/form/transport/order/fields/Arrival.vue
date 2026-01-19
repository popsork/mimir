<template lang="pug">
FormDateField(
    v-model="arrivalRange"
    :changed="currentValueIsManual"
    name="arrival"
    type="datetimerange"
    :label="$t('transport_orders.fields.Arrival')"
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

const arrivalStart = computed<string | null>({
    get: () => {
        return getTransportOrder()?.arrivalStart ?? null;
    },
    set: (value: string | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }

        order.arrivalStart = value;
        order.arrivalStartIsManual = true;
    }
});

const arrivalEnd = computed<string | null>({
    get: () => {
        return getTransportOrder()?.arrivalEnd ?? null;
    },
    set: (value: string | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }

        order.arrivalEnd = value;
        order.arrivalEndIsManual = true;
    }
});

const arrivalRange = computed<[string, string] | null>({
    get: () => {
        if (!arrivalStart.value || !arrivalEnd.value) {
            return null;
        }
        return [
            arrivalStart.value,
            arrivalEnd.value
        ] as [string, string];
    },
    set: (values: [string, string] | null) => {
        const order = getTransportOrder();
        if (!order) {
            return;
        }

        const start = (values && values[0]) ? values[0] : null;
        const end = (values && values[1]) ? values[1] : null;

        order.arrivalStart = start;
        order.arrivalStartIsManual = true;
        order.arrivalEnd = end;
        order.arrivalEndIsManual = true;
    }
});

const currentValueIsManual = computed(() => {
    const order = getTransportOrder();
    if (!order) {
        return;
    }
    // currently, if any of the range endpoints is manual, the whole range is displayed as manual.
    // if this needs altering later, then support for that needs to be added in FormDateField
    return order.arrivalStartIsManual || order.arrivalEndIsManual;
});


const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    fields: ["delivery_earliest_at", "delivery_latest_at"]
});


</script>
<style scoped lang="scss"></style>
