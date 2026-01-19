<template lang="pug">
.field(data-name="phase-and-status")
    OrderStatusBadge(v-if="statusName" :text="phaseAndStatusText" :status="statusName")
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { t } = useI18n();

const { form } = storeToRefs(useOrderFormStore());

const phase = computed(() => {
    // phase is not set on the transport order itself, and should always be taken from the main customer order
    return form.value.order.phase;
});

const statusName = computed(() => {
    const record = getTransportOrder();
    if (!record || !record.status || !record.status.name) {
        return null;
    }
    return record.status.name;
});


const phaseAndStatusText = computed(() => {
    const parts = [] as string[];

    if (phase.value) {
        parts.push(t(`order.phases.${phase.value}`));
    }

    if (statusName.value) {
        parts.push(t(`transport_orders.statuses.${statusName.value}`));
    }

    return parts.join(" ");
});


</script>
<style scoped lang="scss">
.field {
    display: flex;
    justify-content: flex-end;
    height: steps(3.5);
    align-items: center;
}
</style>
