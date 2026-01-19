<template lang="pug">
fieldset(data-name="stop" :data-id="stop.id")
    OrderFormTransportStopAddStopControl(:index="index" position="before")
    .fields
        OrderFormTransportStopIcon(:position="position")
        OrderFormTransportStopFieldsLocation(:stop-index="index")
        OrderFormTransportStopFieldsZone(:stop-index="index")
        OrderFormTransportStopFieldsContact(:stop-index="index")
        OrderFormTransportStopFieldsNotes(:stop-index="index")
        OrderFormTransportStopClearButton(:stop-index="index")
    FormErrors(:errors="rowErrors")
    OrderFormTransportStopAddStopControl(:index="index" position="after")
</template>
<script setup lang="ts">
import type { Stop, StopApiResourceFieldName } from "~/models/Stop";

const props = defineProps<{
    index: number,
    stop: Stop,
    totalNumberOfStops: number,
}>();

const position = computed(() => {
    if (props.index === 0) {
        return StopPosition.First;
    }

    if (props.index === props.totalNumberOfStops - 1) {
        return StopPosition.Last;
    }

    return StopPosition.Middle;
});

const { form } = storeToRefs(useOrderFormStore());

const usedFieldNames: StopApiResourceFieldName[] = [
    "destination",
    "name", "street_name", "street_number", "postal_code", "city", "country", "latitude", "longitude", "accuracy",
    "contact", "phone", "email",
    "notes"
];

const rowErrors = computed(() => form.value.errors.forRecord(props.stop).exceptForFields(usedFieldNames));

</script>
<style scoped lang="scss">
fieldset[data-name="stop"] {
    padding: steps(1);
    background: $color-background-light;

    border-radius: $element-border-radius;
    position: relative;

    .add-stop {
        position: absolute;
        left: steps(1);
        right: steps(3.5);

        &[data-position="before"] {
            top: 0;
        }
        &[data-position="after"] {
            bottom: 0;
        }
    }

    .fields {
        display: flex;
        gap: steps(1);
        align-items: flex-start;

        .icon {
            flex: 0 0 steps(3);
            align-self: center;
            margin-right: steps(-0.5);
        }

        .field[data-name="location"] {
            flex: 0 0 steps(50);
        }
        .field[data-name="zone"] {
            flex: 0 0 steps(16);
            width: steps(16);
        }
        .field[data-name="contact"] {
            flex: 0 0 steps(50);
        }
        .field[data-name="notes"] {
            flex: 0 0 steps(50);
        }
        .button[data-name="clear"] {
            margin-left: auto;
        }

    }

    .errors {
        padding-top: steps(1);
    }
}
</style>
