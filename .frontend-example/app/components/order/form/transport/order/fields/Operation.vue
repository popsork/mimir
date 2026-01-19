<template lang="pug">
FormSelectField(
    v-model="operationId"
    name="operation"
    :label="$t('transport_orders.fields.Operation')"
    :options="options"
    :filterable="true"
    layout="compact"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Operation } from "~/models/Operation";

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { recalculateOrder } = useOrderFormStore();

const operationId = computed({
    get: () => getTransportOrder()?.operationId,
    set: (id: string | null) => {
        const order = getTransportOrder();

        if (!order) {
            return;
        }

        const operation = (id) ? useRepo(Operation).find(id) : null;

        order.operationId = id;
        order.operation = operation;
    }
});


const store = useOrderFormOperationsStore();
const { operations } = storeToRefs(store);

const options = computed(() => {
    const order = getTransportOrder();
    if (!order) {
        return [];
    }

    return buildSelectOptions({
        collection: operations.value,
        currentObject: order.operation,
        builder: (operation) => {
            return {
                value: operation.id,
                label: operation.name
            };
        }
    });
});

store.loadOperationsIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    field: "operation",
});

</script>
<style scoped lang="scss"></style>
