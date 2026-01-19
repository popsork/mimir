export async function convertGoogleGeocoderResultToLocationDetails(result: google.maps.GeocoderResult) {
    // ensure places library is loaded
    await useNuxtApp().$loadGoogleMaps({ libraries: ["places"] });

    let placeName = null;
    if (result.place_id) {
        const place = new google.maps.places.Place({
            id: result.place_id,
            requestedLanguage: getCurrentLocale()
        });

        await place.fetchFields({
            fields: ["displayName"]
        });

        placeName = place.displayName || null;
    }

    const addressComponents = result.address_components;

    const locationDetails = {
        name: placeName,
        country: extractAddressComponent({ addressComponents, componentType: "country" }),
        city: extractAddressComponent({ addressComponents, componentType: "postal_town" })
                || extractAddressComponent({ addressComponents, componentType: "locality" }),
        postalCode: extractAddressComponent({ addressComponents, componentType: "postal_code" }),
        streetName: extractAddressComponent({ addressComponents, componentType: "route" }),
        streetNumber: extractAddressComponent({ addressComponents, componentType: "street_number" }),
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng(),
        accuracy: convertGoogleGeocoderResultToLocationAccuracy(result)
    };

    return locationDetails;
}

const extractAddressComponent = (
    {
        addressComponents,
        componentType,
        nameType = "long_name"
    }: {
        addressComponents: google.maps.GeocoderAddressComponent[],
        componentType: string,
        nameType?: keyof google.maps.GeocoderAddressComponent,
    }
): string | null => {
    const component = addressComponents.find(component => component.types.includes(componentType));
    const value = component?.[nameType] ?? null;
    return Array.isArray(value) ? value.join(", ") : value;
};
