<template lang="pug">
OrdersCalendarItemContent(
    data-type="order"
    :data-item-id="itemId"
    :data-unit-id="unitId"
    :data-order-id="orderId"
)
    template(v-if="orderId")
        .columns
            .column(v-for="attribute in selectedAttributes" :key="attribute") {{ getAttributeText(attribute) }}
</template>
<script setup lang="ts">
const props = defineProps<{
    itemId: string,
    orderId: string,
}>();

const ordersStore = useOrdersCalendarOrdersStore();

const order = computed(() => {
    return ordersStore.getRecordById(props.orderId);
});

const unitId = computed(() => {
    return order.value?.unitId;
});

const attributesStore = useOrdersCalendarOrderAttributesStore();

const { selectedAttributes } = storeToRefs(attributesStore);

const getAttributeText = (attribute: OrdersCalendarOrderAttribute) => {
    if (!order.value) {
        return null;
    }
    return order.value[attribute];
};

</script>
<style scoped lang="scss">
.item-content {

    .columns {
        width: 100%;
        display: flex;

        .column {
            flex: 1 1 0;
            padding: 0 steps(0.5);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>


