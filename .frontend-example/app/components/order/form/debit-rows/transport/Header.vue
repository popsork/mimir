<template lang="pug">
OrderFormDebitRowsHeader(icon="truck")
    template(v-slot:content)
        span.sequence-number {{ transportOrderNumber }}
        span.unit-number {{ unitNumberText }}
        span.stops {{ stopsText }}
    template(v-slot:actions)
        slot
</template>
<script setup lang="ts">
import type { TransportOrder } from "~/models/TransportOrder";

const props = defineProps<{
    transportOrder: TransportOrder,
    transportOrderIndex: number,
}>();

const { form } = storeToRefs(useOrderFormStore());

const transportOrderNumber = computed(() => {
    return props.transportOrderIndex + 1;
});

const unitNumberText = computed(() => {
    const transportOrder = props.transportOrder;
    const unit = transportOrder.unit;
    if (!unit || !unit.number) {
        return getBlankValueLabelText();
    }
    return unit.number;
});

const stopsText = computed(() => {
    const transportOrder = props.transportOrder;

    const stops = form.value.order.stops;

    const pickupStop = (transportOrder.pickupStopId && stops) ? stops.find(stop => stop.id === transportOrder.pickupStopId) : null;

    const deliveryStop = (transportOrder.deliveryStopId && stops) ? stops.find(stop => stop.id === transportOrder.deliveryStopId) : null;

    if (!pickupStop?.name && !deliveryStop?.name) {
        return getBlankValueLabelText();
    }

    return [
        pickupStop?.name,
        deliveryStop?.name
    ].join(" - ");
});

</script>
<style scoped lang="scss">
.header {
    .sequence-number {
        @include normal-medium-text;
        background: $color-background-inverted;
        color: $color-text-inverted;
        height: steps(2);
        width: steps(2);
        border-radius: steps(4);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .unit-number,
    .stops {
        @include large-medium-text;
    }

    .unit-number::after {
        content: "";
        display: inline-block;
        border-right: 1px solid $color-border-darker;

        // this marker line has custom non-grid sizing and positioning tweaks to better match the designs
        width: 1px;
        height: 14px;
        margin-left: steps(1);
        margin-right: 3px;
        position: relative;
        top: 2px;
    }

}
</style>
