<template lang="pug">
OrderFormTabPanel(name="transport")
    component(
        :is="row.component"
        v-for="(row) in rows"
        :key="row.id"
        v-bind="row.props"
    )
    .actions
        GenericButton(
            type="secondary"
            :waiting-for="WaitingFor.OrderFormOrderAutoPlanning"
            v-on:click="autoPlanOrder"
        ) {{ $t("order.actions.Auto-plan") }}
OrderFormTransportOrderRemoveDialog
</template>
<script setup lang="ts">
import type { Stop } from "~/models/Stop";
import type { TransportOrder } from "~/models/TransportOrder";
import { OrderFormTransportStop, OrderFormTransportOrder } from "#components";

const orderFormStore = useOrderFormStore();
const { form } = storeToRefs(orderFormStore);
const { autoPlanOrder } = orderFormStore;

const stops = computed(() => {
    return form.value.order.stops || [];
});

const transportOrders = computed(() => {
    return form.value.order.transportOrders || [];
});

type StopRow = {
    component: typeof OrderFormTransportStop,
    id: string,
    props: {
        index: number,
        stop: Stop,
        totalNumberOfStops: number,
    },
};

type TransportOrderRow = {
    component: typeof OrderFormTransportOrder,
    id: string,
    props: {
        index: number,
        transportOrder: TransportOrder,
        totalNumberOfOrders: number,
    },
};

type Row = StopRow | TransportOrderRow;

const rows = computed(() => {
    const result = [] as Row[];
    stops.value.forEach((stop, index) => {
        result.push({
            component: OrderFormTransportStop,
            id: stop.id,
            props: {
                index,
                stop: stop as Stop,
                totalNumberOfStops: stops.value.length,
            }
        });
        const transportOrder = transportOrders.value[index];
        if (transportOrder) {
            result.push({
                component: OrderFormTransportOrder,
                id: transportOrder.id,
                props: {
                    index,
                    transportOrder: transportOrder as TransportOrder,
                    totalNumberOfOrders: transportOrders.value.length,
                }
            });
        }
    });

    return result;
});


</script>
<style scoped lang="scss">
.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: steps(3);

}
</style>
