<template lang="pug">
FormSelectField(
    v-model="serviceId"
    :changed="order.serviceIdIsManual"
    name="service"
    :label="$t('order.fields.Service')"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Service } from "~/models/Service";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const serviceId = computed({
    get: () => order.value.serviceId,
    set: (id: string) => {
        order.value.serviceId = id;
        order.value.serviceIdIsManual = true;
        order.value.service = (id) ? useRepo(Service).find(id) : null;
    }
});

const store = useOrderFormServicesStore();

const operationId = computed(() => order.value.operationId);

const options = computed(() => {
    return buildSelectOptions({
        collection: store.getMainServicesByOperationId(operationId.value),
        currentObject: order.value.service,
        builder: (service) => {
            return {
                value: service.id,
                label: service.name
            };
        }
    });
});

store.loadServicesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "service",
});

</script>
<style scoped lang="scss"></style>
