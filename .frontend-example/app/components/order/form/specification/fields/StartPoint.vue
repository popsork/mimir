<template lang="pug">
FormLocationField(
    :id="`specification-row-${specificationRowIndex}-start-point`"
    v-model="destination"
    name="start-point"
    :destination-is-persisted="destination.isPersisted"
    :label="$t('specification_rows.fields.Start point')"
    :label-visible="specificationRowIndex === 0"
    :dialog-submission-label="$t('locations.actions.Update specification row')"
    :errors="errors"
)
</template>
<script setup lang="ts">
import { Destination, type DestinationWithLocation } from "~/models/Destination";
import { Location } from "~/models/Location";

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const destination = computed({
    get: () => {
        // the destination is always constructed from the rows's values,
        // not from the destinations store

        const record = new Destination();
        record.location = new Location();

        const specificationRow = getSpecificationRow();
        if (!specificationRow) {
            return record as DestinationWithLocation;
        }

        if (specificationRow.startPointDestinationId) {
            record.id = specificationRow.startPointDestinationId;
            record.isPersisted = true;

            // if the row has a start point destination, then it must also have a location as well
            // but wrap in a condition just in case it is missing
            if (specificationRow.startPointDestination?.location) {
                record.location.id = specificationRow.startPointDestination.location.id;
            }
        }

        record.name = specificationRow.startPointName;

        record.location.streetName = specificationRow.startPointStreetName;
        record.location.streetNumber = specificationRow.startPointStreetNumber;
        record.location.postalCode = specificationRow.startPointPostalCode;
        record.location.city = specificationRow.startPointCity;
        record.location.country = specificationRow.startPointCountry;
        record.location.latitude = specificationRow.startPointLatitude;
        record.location.longitude = specificationRow.startPointLongitude;
        record.location.accuracy = specificationRow.startPointAccuracy;

        return record as DestinationWithLocation;
    },

    set: (destination: DestinationWithLocation) => {
        const specificationRow = getSpecificationRow();

        if (!specificationRow) {
            return;
        }

        const location = destination.location;

        const destinationExists = !!destination.id;

        specificationRow.startPointDestinationId = (destination.isPersisted) ? destination.id : null;
        specificationRow.startPointDestination = (destinationExists) ? destination : null;

        // all values should get copied to the record itself
        specificationRow.startPointName = destination.name;

        specificationRow.startPointStreetName = location.streetName;
        specificationRow.startPointStreetNumber = location.streetNumber;
        specificationRow.startPointPostalCode = location.postalCode;
        specificationRow.startPointCity = location.city;
        specificationRow.startPointCountry = location.country;
        specificationRow.startPointLatitude = location.latitude;
        specificationRow.startPointLongitude = location.longitude;
        specificationRow.startPointAccuracy = location.accuracy;
        recalculateOrder();
    },
});

// since location is a custom compound field, it should display errors for all attributes that are used inside it.
// these are also duplicated inside the location dialog next to each individual field
const { errors: apiErrors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    fields: [
        "start_point_name",
        "start_point_street_name",
        "start_point_street_number",
        "start_point_postal_code",
        "start_point_city",
        "start_point_country",
        "start_point_latitude",
        "start_point_longitude",
        "start_point_accuracy"
    ],
});

const errors = computed(() => {
    // we need to map the errors to the fields that are used in the dialog
    // so that they can be displayed next to the individual fields
    return apiErrors.value.remapFields({
        "start_point_name": "name",
        "start_point_street_name": "street_name",
        "start_point_street_number": "street_number",
        "start_point_postal_code": "postal_code",
        "start_point_city": "city",
        "start_point_country": "country",
        "start_point_latitude": "latitude",
        "start_point_longitude": "longitude",
        "start_point_accuracy": "accuracy",
    });
});


</script>
<style scoped lang="scss"></style>
