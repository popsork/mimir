<template lang="pug">
.order-hint(v-if="order")
    h4.title {{ title }}
    p.times {{ timePeriodText }}
    p.number {{ numberText }}
    p.status {{ statusText }}
</template>
<script setup lang="ts">
const props = defineProps<{
    orderId: string | null,
}>();

const ordersStore = useOrdersCalendarOrdersStore();
const { t } = useI18n();

const order = computed(() => {
    if (!props.orderId) {
        return null;
    }

    return ordersStore.getRecordById(props.orderId);
});


const attributesStore = useOrdersCalendarOrderAttributesStore();

const { selectedAttributes } = storeToRefs(attributesStore);

const getAttributeText = (attribute: OrdersCalendarOrderAttribute) => {
    if (!order.value) {
        return null;
    }
    return order.value[attribute];
};

const attributeTexts = computed(() => {
    return selectedAttributes.value.map((attribute) => {
        return getAttributeText(attribute);
    });
});

const title = computed(() => {
    if (!order.value) {
        return "";
    }
    return attributeTexts.value.join(" ");
});

const numberText = computed(() => {
    if (!order.value) {
        return "";
    }
    const labelText = t(`transport_orders.fields.Number`);
    const valueText = order.value.number;

    return `${labelText}: ${valueText}`;
});

const statusText = computed(() => {
    if (!order.value) {
        return "";
    }
    const labelText = t(`transport_orders.Status`);
    const valueText = t(`transport_orders.statuses.${order.value.status}`);

    return `${labelText}: ${valueText}`;
});

const timePeriodText = computed(() => {
    if (!order.value) {
        return "";
    }
    return getTimePeriodText(order.value.startsAt, order.value.endsAt);
});

</script>
<style scoped lang="scss">
.order-hint {
    .title {
        @include normal-medium-text;
        color: $color-text-normal;
    }

    .times,
    .status {
        @include normal-text;
        color: $color-text-lighter;
    }
}
</style>
