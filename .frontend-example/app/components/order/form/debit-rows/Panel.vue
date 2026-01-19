<template lang="pug">
OrderFormTabPanel(name="debit-rows" :data-target="target")
    template(v-if="target === DebitRowTarget.Customer")
        OrderFormDebitRowsCustomerHeader
            OrderFormDebitRowsAddRowControl(:transport-order-id="transportOrderId" v-on:add="focusLastRow")
    template(v-else-if="transportOrder && transportOrderIndex !== null")
        OrderFormDebitRowsTransportHeader(
            :transport-order-index="transportOrderIndex"
            :transport-order="transportOrder"
        )
            OrderFormDebitRowsAddRowControl(:transport-order-id="transportOrderId" v-on:add="focusLastRow")

    .rows
        OrderFormDebitRowsRow(
            v-for="(debitRow, index) in debitRows"
            :key="index"
            ref="rows"
            :index="index"
            :debit-row="debitRow"
        )

</template>
<script setup lang="ts">
import type { DebitRow } from "~/models/DebitRow";
import type { TransportOrder } from "~/models/TransportOrder";

const props = defineProps<{
    transportOrderIndex: number | null,
}>();

const { form } = storeToRefs(useOrderFormStore());

const transportOrder = computed(() => {
    if (props.transportOrderIndex === null) {
        return null;
    }
    const rows = (form.value.order.transportOrders || []) as TransportOrder[];

    return rows[props.transportOrderIndex];
});

const { getDebitRows } = useOrderFormDebitRowsStore();


const debitRows = computed(() => {
    return getDebitRows(transportOrderId.value) as DebitRow[];
});

const transportOrderId = computed(() => {
    return (transportOrder.value) ? transportOrder.value.id : null;
});

const target = computed<DebitRowTarget>(() => {
    return (transportOrderId.value === null) ? DebitRowTarget.Customer : DebitRowTarget.Transport;
});

const rowRefs = useTemplateRef("rows");

const focusLastRow = async () => {
    await nextTick();
    if (!rowRefs.value || rowRefs.value.length < 1) {
        return;
    }

    const lastRow = rowRefs.value[rowRefs.value.length - 1];
    lastRow!.focus();
};

</script>
<style scoped lang="scss">
[data-name="debit-rows"] {

    .header {
        margin-bottom: steps(1);
    }

    .rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: steps(0.5);
    }
}
</style>
