<template lang="pug">
FormLocationField(
    :id="`stop-${stopIndex}-location`"
    v-model="destination"
    :destination-is-persisted="destination.isPersisted"
    name="location"
    layout="compact"
    :label="$t('stops.fields.Location')"
    :dialog-submission-label="$t('locations.actions.Update stop')"
    :errors="errors"
    v-on:clear="handleClear"
)
</template>
<script setup lang="ts">
import { Destination, type DestinationWithLocation } from "~/models/Destination";
import { Location } from "~/models/Location";

const props = defineProps<{
    stopIndex: number,
}>();

const { getStop } = useOrderFormStopAccessor(() => props.stopIndex);

const { recalculateOrder } = useOrderFormStore();

const destination = computed({
    get: () => {
        // the destination is always constructed from the stop's values,
        // not from the destinations store

        const record = new Destination();
        record.location = new Location();

        const stop = getStop();
        if (!stop) {
            return record as DestinationWithLocation;
        }

        if (stop.destinationId) {
            record.id = stop.destinationId;
            record.isPersisted = true;

            // if the stop has a destination, then it must also have a location as well
            // but wrap in a condition just in case it is missing
            if (stop.destination?.location) {
                record.location.id = stop.destination.location.id;
            }
        }

        record.name = stop.name;

        record.contact = stop.contact;
        record.phone = stop.phone;
        record.email = stop.email;
        record.notes = stop.notes;

        record.location.streetName = stop.streetName;
        record.location.streetNumber = stop.streetNumber;
        record.location.postalCode = stop.postalCode;
        record.location.city = stop.city;
        record.location.country = stop.country;
        record.location.latitude = stop.latitude;
        record.location.longitude = stop.longitude;
        record.location.accuracy = stop.accuracy;

        return record as DestinationWithLocation;
    },

    set: (destination: DestinationWithLocation) => {
        const stop = getStop();

        if (!stop) {
            return;
        }

        const location = destination.location;

        const destinationExists = !!destination.id;

        stop.destinationId = (destination.isPersisted) ? destination.id : null;
        stop.destination = (destinationExists) ? destination : null;

        // all values should get copied to the record itself
        stop.name = destination.name;

        if (destinationExists) {
            // only overwrite destination fields if an existing destination has been selected.
            // otherwise leave the values untouched, as they may have been set through the dialog or custom input
            // and switching to a custom location name or changing the address should not clear the contact details and notes
            stop.contact = destination.contact;
            stop.phone = destination.phone;
            stop.email = destination.email;
            stop.notes = destination.notes;
        }

        stop.streetName = location.streetName;
        stop.streetNumber = location.streetNumber;
        stop.postalCode = location.postalCode;
        stop.city = location.city;
        stop.country = location.country;
        stop.latitude = location.latitude;
        stop.longitude = location.longitude;
        stop.accuracy = location.accuracy;
        recalculateOrder();
    },
});

// since location is a custom compound field, it should display errors for all attributes that are used inside it.
// these are also duplicated inside the location dialog next to each individual field
const { errors } = useOrderFormFieldErrors({
    recordAccessor: getStop,
    fields: [
        "destination",
        "name",
        "street_name",
        "street_number",
        "postal_code",
        "city",
        "country",
        "latitude",
        "longitude",
        "accuracy"
    ],
});

const handleClear = async () => {
    // clicking the clear button inside the location field should clear the whole stop
    // same as the clear button on the right side of the stop row

    // this should happen after the setter has been already called, so wait for the next tick
    await nextTick();

    const stop = getStop();
    if (!stop) {
        return;
    }

    stop.clear();
};



</script>
<style scoped lang="scss"></style>
