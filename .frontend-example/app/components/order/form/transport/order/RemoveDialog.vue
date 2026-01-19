<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="$t('transport_orders.remove.Remove transport order')" v-on:cancel="close")
    GenericForm(id="remove-transport-order" v-on:submit.prevent="removeTransportOrder")
        p.description {{ $t('transport_orders.remove.Select stop to be removed') }}
        FormRadioField(
            v-for="option in removableStopOptions"
            :key="option.value"
            v-model="removableStopId"
            :value="option.value"
        )
            p.position {{ option.positionText }}
            p.location {{ option.locationText }}
            p.contact {{ option.contactText }}
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="remove-transport-order"
        ) {{ $t("transport_orders.actions.Remove") }}
</template>
<script setup lang="ts">
import type { TransportOrder } from "~/models/TransportOrder";
import type { Stop } from "~/models/Stop";

const { t } = useI18n();
const store = useOrderFormStopsStore();

const { removableTransportOrderId, removableStops } = storeToRefs(store);

const shouldShowDialog = computed(() => removableTransportOrderId.value !== null);

const removableStopId = ref(null as string | null);

watch(removableStops, () => {
    // ensure a valid default value is selected in the dialog
    if (
        (removableStopId.value === null) ||
        (!removableStops.value.map(stop => stop.id).includes(removableStopId.value))
    ) {
        removableStopId.value = removableStops.value[0]?.id ?? null;
    }
}, { immediate: true });


type RemovableStopOption = {
    value: string,
    positionText: string,
    locationText: string,
    contactText: string,
};

const removableStopOptions = computed(() => {
    const options = [] as RemovableStopOption[];
    if (!removableTransportOrderId.value) {
        return options;
    }
    const transportOrder = store.getTransportOrderById(removableTransportOrderId.value);
    if (!transportOrder) {
        return options;
    }

    removableStops.value.forEach((stop) => {
        options.push({
            value: stop.id,
            positionText: getStopPositionText(stop, transportOrder),
            locationText: getStopLocationText(stop),
            contactText: getStopContactText(stop),
        });
    });
    return options;
});

const getStopPositionText = (stop: Stop, transportOrder: TransportOrder) => {
    if (stop.id === transportOrder.pickupStopId) {
        return t("transport_orders.remove.Previous");
    }
    if (stop.id === transportOrder.deliveryStopId) {
        return t("transport_orders.remove.Next");
    }
    return "";
};

const getStopLocationText = (stop: Stop) => {
    return stop.getLabel() || getBlankValueLabelText();
};

const getStopContactText = (stop: Stop) => {
    // do not use blank value label text here, because there is no label for "contact",
    // so simply not showing any text is fine
    return stop.contact || "";
};


const close = () => {
    store.clearRemovableTransportOrderId();
};

const { recalculateOrder } = useOrderFormStore();

const removeTransportOrder = () => {
    if (!removableTransportOrderId.value || !removableStopId.value) {
        return;
    }

    store.removeTransportOrderAndStop({
        transportOrderId: removableTransportOrderId.value,
        stopId: removableStopId.value
    });

    recalculateOrder();

    close();
};

</script>
<style scoped lang="scss">
form {
    width: steps(54);

    .description {
        margin-bottom: steps(1.5);
    }

    .field {
        margin-bottom: steps(1.5);

        .position {
            @include small-medium-text;
            color: $color-text-lightest;
        }

        .location,
        .contact {
            @include normal-text;
        }
    }
}
</style>
