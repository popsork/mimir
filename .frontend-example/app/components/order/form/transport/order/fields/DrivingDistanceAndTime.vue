<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="driving-distance-and-time"
    layout="compact"
    :label="$t('transport_orders.fields.Distance and time')"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const distanceInKilometres = computed(() => {
    return getTransportOrder()?.drivingDistanceInKilometres ?? null;
});

const distanceText = computed(() => {
    if (distanceInKilometres.value === null) {
        return null;
    }

    return localizeDistance(distanceInKilometres.value);
});

const timeInMinutes = computed(() => {
    return getTransportOrder()?.drivingTimeInMinutes ?? null;
});

const timeText = computed(() => {
    if (timeInMinutes.value === null) {
        return null;
    }

    return localizeDuration(timeInMinutes.value);
});

const valueText = computed(() => {
    const parts = [
        distanceText.value,
        timeText.value,
    ].filter(part => part !== null);

    if (parts.length === 0) {
        return null;
    }

    return parts.join(" / ");
});

</script>
<style scoped lang="scss"></style>
