<template lang="pug">
FormSelectField(
    v-model="operationId"
    :changed="order.operationIdIsManual"
    name="operation"
    :label="$t('order.fields.Operation')"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Operation } from "~/models/Operation";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const operationId = computed({
    get: () => order.value.operationId,
    set: (id: string) => {
        order.value.operationId = id;
        order.value.operationIdIsManual = true;
        order.value.operation = (id) ? useRepo(Operation).find(id) : null;
    }
});

const store = useOrderFormOperationsStore();
const { operations } = storeToRefs(store);

const options = computed(() => {
    return buildSelectOptions({
        collection: operations.value,
        currentObject: order.value.operation,
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
    recordAccessor: () => order.value,
    field: "operation",
});


</script>
<style scoped lang="scss"></style>
