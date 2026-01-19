<template lang="pug">
GenericButton(type="secondary" size="small" v-on:click="performLookup") {{ $t("locations.actions.Look up location") }}
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const { showMessage } = useFloatingMessage();
const { t } = useI18n();

const performLookup = async () => {
    await useNuxtApp().$loadGoogleMaps({ libraries: ["geocoding"] });

    const location = form.value.destination.location;

    const lookupParts = [
        location.streetName && location.streetNumber ? `${location.streetName} ${location.streetNumber}` : location.streetName,
        location.city,
        location.postalCode,
        location.country,
    ];

    const lookupAddress = lookupParts.filter(Boolean).join(", ");
    if (lookupAddress === "") {
        return;
    }


    const geocoder = new google.maps.Geocoder();

    try {
        const { results } = await geocoder.geocode({
            address: lookupAddress,

            componentRestrictions: {
                country: location.country || undefined
            }
        });

        if (!results || !results[0]) {
            throw google.maps.GeocoderStatus.UNKNOWN_ERROR;
        }

        const locationDetails = await convertGoogleGeocoderResultToLocationDetails(results[0]);

        // the geocoding lookup is based only on the address parts and does not include the currently set name,
        // so the result name is not reliable as it mostly contains only the street name + number.
        // therefore only update the location values and not the destination name

        location.country = locationDetails.country;
        location.city = locationDetails.city;
        location.postalCode = locationDetails.postalCode;
        location.streetName = locationDetails.streetName;
        location.streetNumber = locationDetails.streetNumber;
        location.latitude = locationDetails.latitude;
        location.longitude = locationDetails.longitude;
        location.accuracy = locationDetails.accuracy;

    } catch (error) {
        const status = error as google.maps.GeocoderStatus;
        showMessage({
            type: FloatingMessageType.Error,
            text: [
                t("locations.errors.Geocoding failed"),
                status.toString()
            ].join(": ")
        });
    }
};

</script>
<style scoped lang="scss"></style>
