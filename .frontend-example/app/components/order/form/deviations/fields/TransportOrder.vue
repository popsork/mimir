<template lang="pug">
FormSelectField(
    v-model="transportOrderId"
    name="transport-order"
    :label="$t('deviation_rows.fields.Transport order')"
    :label-visible="deviationRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import type { SelectOption } from "~/components/form/SelectField.vue";

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const orderFormStore = useOrderFormStore();

const { recalculateOrder } = orderFormStore;

const { order } = storeToRefs(orderFormStore);

const transportOrders = computed(() => {
    return order.value.transportOrders ?? [];
});

const transportOrderId = computed({
    get: () => getDeviationRow()?.transportOrderId,
    set: (id: string | null) => {
        const deviationRow = getDeviationRow();

        if (!deviationRow) {
            return;
        }

        const transportOrder = transportOrders.value.find(item => item.id === id) ?? null;

        deviationRow.transportOrderId = id;
        deviationRow.transportOrder = transportOrder;
    }
});


const options = computed(() => {
    const deviationRow = getDeviationRow();
    if (!deviationRow) {
        return [];
    }

    // this option list does not use the buildSelectOptions helper as other dropdowns fields do,
    // because we should not prepend the existing record to the options if it has disappeared from the list.
    // if a transport order disappears, the field simply gets reset to blank
    const options: SelectOption[] = transportOrders.value.map((transportOrder, index) => {
        const labelParts = [];
        labelParts.push(`${index + 1}`);
        if (transportOrder.stage) {
            labelParts.push(transportOrder.stage.label);
        }
        const label = labelParts.join(" - ");

        return {
            value: transportOrder.id,
            label
        };
    });

    return options;
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDeviationRow,
    fields: ["transportOrder"],
});

</script>
<style scoped lang="scss"></style>
