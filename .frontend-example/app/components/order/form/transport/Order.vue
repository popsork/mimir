<template lang="pug">
fieldset(data-name="transport-order" :data-id="transportOrder.id")
    .fieldsets
        fieldset(data-name="header")
            OrderFormTransportOrderFieldsNumber(:transport-order-index="index")
            OrderFormTransportOrderFieldsUnit(:transport-order-index="index")
            OrderFormTransportOrderFieldsLine(:transport-order-index="index")
            OrderFormTransportOrderFieldsOperation(:transport-order-index="index")
            OrderFormTransportOrderFieldsStage(:transport-order-index="index")
        OrderFormTransportOrderFieldsDriverInstructions(:transport-order-index="index")
        fieldset(data-name="times")
            OrderFormTransportOrderFieldsDeparture(:transport-order-index="index")
            OrderFormTransportOrderFieldsArrival(:transport-order-index="index")
        fieldset(data-name="summary")
            OrderFormTransportOrderFieldsAmount(:transport-order-index="index")
            OrderFormTransportOrderFieldsDrivingDistanceAndTime(:transport-order-index="index")
            OrderFormTransportOrderFieldsPhaseAndStatus(:transport-order-index="index")
            OrderFormTransportOrderFieldsLatestTrackingEvent(:transport-order-index="index")
        OrderFormTransportOrderRemoveButton(v-if="orderIsRemovable" :transport-order-index="index")
    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { TransportOrder, TransportOrderApiResourceFieldName } from "~/models/TransportOrder";

const props = defineProps<{
    index: number,
    transportOrder: TransportOrder,
    totalNumberOfOrders: number,
}>();

const orderIsRemovable = computed(() => {
    return props.totalNumberOfOrders > 1;
});

const { form } = storeToRefs(useOrderFormStore());

const usedFieldNames: TransportOrderApiResourceFieldName[] = [
    "line", "operation", "transportOrderStage",
    "driver_instructions",
    "pickup_earliest_at", "pickup_latest_at",
    "delivery_earliest_at", "delivery_latest_at"
];

const rowErrors = computed(() => form.value.errors.forRecord(props.transportOrder).exceptForFields(usedFieldNames));

</script>
<style scoped lang="scss">
fieldset[data-name="transport-order"] {
    padding: steps(1.5) 0 steps(1.5) steps(6);
    border-radius: $element-border-radius;

    .fieldsets {
        display: flex;
        gap: steps(1);
        align-items: flex-start;
    }

    fieldset[data-name="header"] {
        flex: 0 0 steps(49);

        display: grid;
        gap: steps(1);
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);

        .field[data-name="number"] {
            grid-column: 1;
            grid-row: 1;
        }
        .field[data-name="unit"] {
            grid-column: 1;
            grid-row: 2;
        }
        .field[data-name="line"] {
            grid-column: 2;
            grid-row: 1;
        }
        .field[data-name="operation"] {
            grid-column: 3;
            grid-row: 1;
        }
        .field[data-name="stage"] {
            grid-column: 3;
            grid-row: 2;
        }
    }

    .field[data-name="driver_instructions"] {
        flex: 0 0 steps(67);
        align-self: stretch;
    }

    fieldset[data-name="times"] {
        flex: 0 0 steps(26);

        display: grid;
        gap: steps(1);
        grid-template-columns: repeat(1, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }

    fieldset[data-name="summary"] {
        margin-left: auto;
        flex: 0 0 steps(34);

        display: grid;
        gap: steps(1);
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);

        .field[data-name="amount"] {
            grid-column: 1;
            grid-row: 1;
        }

        .field[data-name="driving-distance-and-time"] {
            grid-column: 1;
            grid-row: 2;
        }

        .field[data-name="phase-and-status"] {
            grid-column: 2;
            grid-row: 1;
        }

        .field[data-name="latest-tracking-event"] {
            grid-column: 2;
            grid-row: 2;
        }
    }

    .button[data-name="remove"] {
        margin-top: steps(-0.5);
        margin-left: steps(-1);
    }

    .errors {
        padding-top: steps(1);
    }

}
</style>
