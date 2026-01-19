<template lang="pug">
FormLocationField(
    :id="`specification-row-${specificationRowIndex}-end-point`"
    v-model="destination"
    name="end-point"
    :destination-is-persisted="destination.isPersisted"
    :label="$t('specification_rows.fields.End point')"
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

        if (specificationRow.endPointDestinationId) {
            record.id = specificationRow.endPointDestinationId;
            record.isPersisted = true;

            // if the row has an end point destination, then it must also have a location as well
            // but wrap in a condition just in case it is missing
            if (specificationRow.endPointDestination?.location) {
                record.location.id = specificationRow.endPointDestination.location.id;
            }
        }

        record.name = specificationRow.endPointName;

        record.location.streetName = specificationRow.endPointStreetName;
        record.location.streetNumber = specificationRow.endPointStreetNumber;
        record.location.postalCode = specificationRow.endPointPostalCode;
        record.location.city = specificationRow.endPointCity;
        record.location.country = specificationRow.endPointCountry;
        record.location.latitude = specificationRow.endPointLatitude;
        record.location.longitude = specificationRow.endPointLongitude;
        record.location.accuracy = specificationRow.endPointAccuracy;

        return record as DestinationWithLocation;
    },

    set: (destination: DestinationWithLocation) => {
        const specificationRow = getSpecificationRow();

        if (!specificationRow) {
            return;
        }

        const location = destination.location;

        const destinationExists = !!destination.id;

        specificationRow.endPointDestinationId = (destination.isPersisted) ? destination.id : null;
        specificationRow.endPointDestination = (destinationExists) ? destination : null;

        // all values should get copied to the record itself
        specificationRow.endPointName = destination.name;

        specificationRow.endPointStreetName = location.streetName;
        specificationRow.endPointStreetNumber = location.streetNumber;
        specificationRow.endPointPostalCode = location.postalCode;
        specificationRow.endPointCity = location.city;
        specificationRow.endPointCountry = location.country;
        specificationRow.endPointLatitude = location.latitude;
        specificationRow.endPointLongitude = location.longitude;
        specificationRow.endPointAccuracy = location.accuracy;
        recalculateOrder();
    },
});

// since location is a custom compound field, it should display errors for all attributes that are used inside it.
// these are also duplicated inside the location dialog next to each individual field
const { errors: apiErrors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    fields: [
        "end_point_name",
        "end_point_street_name",
        "end_point_street_number",
        "end_point_postal_code",
        "end_point_city",
        "end_point_country",
        "end_point_latitude",
        "end_point_longitude",
        "end_point_accuracy"
    ],
});

const errors = computed(() => {
    // we need to map the errors to the fields that are used in the dialog
    // so that they can be displayed next to the individual fields
    return apiErrors.value.remapFields({
        "end_point_name": "name",
        "end_point_street_name": "street_name",
        "end_point_street_number": "street_number",
        "end_point_postal_code": "postal_code",
        "end_point_city": "city",
        "end_point_country": "country",
        "end_point_latitude": "latitude",
        "end_point_longitude": "longitude",
        "end_point_accuracy": "accuracy",
    });
});


</script>
<style scoped lang="scss"></style>
