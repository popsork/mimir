<template lang="pug">
OrderFormHeaderFieldset(:title="$t('order.fieldsets.Additional services')" name="additional-services")
    .content
        WaitingBox(:while="WaitingFor.OrderFormServices")
            .options
                FormCheckboxField(
                    v-for="option in additionalServiceOptions"
                    :key="option.value"
                    v-model="order.additionalServiceIds"
                    name="additional-services[]"
                    :value="option.value"
                    :label="option.label"
                    v-on:change="recalculateOrder"
                )
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const servicesStore = useOrderFormServicesStore();

const { additionalServices } = storeToRefs(servicesStore);

const displayableServices = computed(() => {
    // display checkboxes for all additional services that are available for the order's operation,
    // plus any additional services that are already selected on the order even if not available for the operation
    // (those checkboxes will disappear if the user unchecks them)
    const definedServices = additionalServices.value;

    const availableServiceIds = servicesStore.getAdditionalServicesByOperationId(order.value.operationId).map(service => service.id);

    const selectedServiceIds = order.value.additionalServiceIds || [];

    return definedServices.filter(service => availableServiceIds.includes(service.id) || selectedServiceIds.includes(service.id));
});

const additionalServiceOptions = computed(() => {
    return displayableServices.value.map((service) => {
        return {
            value: service.id,
            label: service.name,
        };
    });
});

servicesStore.loadServicesIfNeeded();

</script>
<style scoped lang="scss">
fieldset[data-name="additional-services"] {
    contain: size; // prevent item from stretching the fieldsets flex row height
    overflow: hidden;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr); // first row for the title, second row fills remaining space with .content

    .content {
        overflow-y: auto;

        .options {
            display: flex;
            flex-direction: column;
            gap: steps(1);
        }
    }

}
</style>
