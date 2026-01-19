<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="latest-tracking-event"
    layout="compact"
    :label="$t('transport_orders.fields.Latest tracking event')"
)

</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { t } = useI18n();

const latestTrackingEvent = computed(() => {
    return getTransportOrder()?.latestTrackingEvent ?? null;
});

const valueText = computed(() => {
    if (!latestTrackingEvent.value || !latestTrackingEvent.value.eventType) {
        return null;
    }
    const parts = [] as string[];

    const typeText = t(`tracking_events.types.${latestTrackingEvent.value.eventType}`);
    parts.push(typeText);

    const cityText = latestTrackingEvent.value.city;
    if (cityText) {
        parts.push(cityText);
    }

    const formattedTime = formatSystemTimeZoneTime(latestTrackingEvent.value.createdAt);
    if (formattedTime) {
        parts.push(formattedTime);
    }

    return parts.join("; ");
});


</script>
<style scoped lang="scss"></style>
