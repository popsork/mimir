export const useFormLocationDialogMap = () => {
    const store = useOrderFormLocationDialogStore();

    const { form } = storeToRefs(store);

    const configuration = useConfiguration();

    const defaultCenter = computed(() => ({
        lat: parseFloat(configuration.formLocationDialogMapCenterLat || "0"),
        lng: parseFloat(configuration.formLocationDialogMapCenterLng || "0")
    }));

    const defaultZoom = computed(() => parseInt(configuration.formLocationDialogMapInitialZoomLevel || "8"));

    const map = shallowRef(null as google.maps.Map | null);

    const initializeMap = async ( { container } : { container: HTMLDivElement }) => {
        await useNuxtApp().$loadGoogleMaps({ libraries: ["marker", "geocoding", "places"] });

        const googleMap = new google.maps.Map(container, {
            center: defaultCenter.value,
            zoom: defaultZoom.value,
            mapId: configuration.googleMapId,
            renderingType: google.maps.RenderingType.RASTER
        });

        map.value = googleMap;

        initializeMarker();
        initializeSearch();
    };


    const marker = shallowRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    // marker object is non-reactive, so we cannot use its position directly in computed properties.
    // to make it reactive, we manually update a separate ref whenever the marker position changes
    const markerCoordinates = ref<{ lat: number, lng: number } | null>(null);

    const initializeMarker = () => {
        if (!map.value) {
            return;
        }

        clearMarker();

        if (form.value.destination.location.latitude && form.value.destination.location.longitude) {
            const position = new google.maps.LatLng(
                form.value.destination.location.latitude,
                form.value.destination.location.longitude
            );
            addMarker(position);
            centerMapOnLocation(position);
        }

        google.maps.event.clearListeners(map.value, "click"); // prevent duplicate handlers on repeated marker initialization
        map.value.addListener("click", (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) {
                return;
            }
            clearMarker();
            addMarker(event.latLng);
            updateLocationFromMarker({ accuracy: LocationAccuracy.Manual });
        });
    };

    const addMarker = (location: google.maps.LatLng) => {
        marker.value = new google.maps.marker.AdvancedMarkerElement({
            position: location,
            map: map.value,
            title: `Lat: ${location.lat()}, Lng: ${location.lng()}`,
            gmpDraggable: true
        });
        refreshMarkerCoordinates();

        marker.value.addListener("dragend", () => {
            refreshMarkerCoordinates();
            updateLocationFromMarker({ accuracy: LocationAccuracy.Manual });
        });
    };

    const clearMarker = () => {
        if (!marker.value) {
            return;
        }
        marker.value.map = null; // marker needs to be detached from the map before it can be cleared
        marker.value = null;
    };

    const centerMapOnLocation = (location: google.maps.LatLng) => {
        if (!map.value) {
            return;
        }
        map.value.setCenter(location);
        // since there is already a marker on the map, we do not need to show the whole map in its default zoom level,
        // so zoom to a fixed level close enough to the marker to see the streets and surroundings
        map.value.setZoom(14);
    };

    const refreshMarkerCoordinates = () => {
        // this updates the markerCoordinates ref from the current actual position of the marker
        if (!marker.value || !marker.value.position) {
            markerCoordinates.value = null;
            return;
        }
        const position = marker.value.position;
        const lat = typeof position.lat === "function" ? position.lat() : position.lat;
        const lng = typeof position.lng === "function" ? position.lng() : position.lng;
        markerCoordinates.value = { lat, lng };
    };

    const updateLocationFromMarker = (
        {
            accuracy,
            updateNameAndAddress,
        }: {
            accuracy: LocationAccuracy,
            updateNameAndAddress?: boolean,
        }
    ) => {
        setLocationCoordinatesFromMarker({ accuracy });

        // to prevent losing user-entered address parts by replacing them with some geocoding result when the user clicks on the map,
        // we only update the address and name parts from google if the location has no address parts stored yet,
        // or if the updateNameAndAddress flag is explicitly set to true, as in the case of using the place search
        const shouldUpdateNameAndAddress = updateNameAndAddress === undefined
            ? !form.value.locationHasAddressParts
            : updateNameAndAddress;
        if (shouldUpdateNameAndAddress) {
            setLocationNameAndAddressFromMarker();
        }
    };

    const locationCoordinatesBeingChangedInternally = ref(false);

    const setLocationCoordinatesFromMarker = ({ accuracy }: { accuracy: LocationAccuracy }) => {
        if (!markerCoordinates.value) {
            return;
        }
        // set a flag to prevent the watcher from reacting to this change
        locationCoordinatesBeingChangedInternally.value = true;
        const location = form.value.destination.location;
        location.latitude = markerCoordinates.value.lat;
        location.longitude = markerCoordinates.value.lng;
        location.accuracy = accuracy;
        nextTick(() => {
            // reset the flag on next tick to ensure that the watcher has already been triggered
            locationCoordinatesBeingChangedInternally.value = false;
        });
    };

    const locationCoordinates = computed(() => {
        return {
            lat: form.value.destination.location.latitude,
            lng: form.value.destination.location.longitude
        };
    });

    watch(locationCoordinates, () => {
        // this is used to clear the marker when the coordinates get set to null via the clear button
        // or changed to some other value from outside, e.g. by clicking the lookup button
        if (!map.value || locationCoordinatesBeingChangedInternally.value) {
            return;
        }
        initializeMarker();
    }, { deep: true, immediate: true });


    const setLocationNameAndAddressFromMarker = async () => {
        const locationDetails = await getLocationDetailsFromMarker();
        if (!locationDetails) {
            return;
        }

        form.value.destination.name = locationDetails.name;

        const location = form.value.destination.location;

        location.country = locationDetails.country;
        location.city = locationDetails.city;
        location.postalCode = locationDetails.postalCode;
        location.streetName = locationDetails.streetName;
        location.streetNumber = locationDetails.streetNumber;

        // we ignore resolved latitude, longitude and accuracy details here
        // to preserve the values set from the marker
    };

    const { showMessage } = useFloatingMessage();
    const { t } = useI18n();

    const getLocationDetailsFromMarker = async () => {
        if (!markerCoordinates.value) {
            return;
        }

        const geocoder = new google.maps.Geocoder();

        try {
            const { results } = await geocoder.geocode({
                location: markerCoordinates.value,
                language: getCurrentLocale()
            });

            if (!results || !results[0]) {
                throw google.maps.GeocoderStatus.UNKNOWN_ERROR;
            }

            return await convertGoogleGeocoderResultToLocationDetails(results[0]);

        } catch (error) {
            displayGeocodingError(error);
        }
    };

    // at the time of writing, the @types/google.maps package does not yet include the type
    // for the google.maps.places.PlacePredictionSelectEvent
    // so we define a custom type here.
    // this should be changed to the official type once it becomes available in the package.
    type GmpSelectEvent = Event & {
        placePrediction: google.maps.places.PlacePrediction,
    };

    const initializeSearch = () => {
        if (!map.value) {
            return;
        }

        const autocomplete = new google.maps.places.PlaceAutocompleteElement({
            requestedLanguage: getCurrentLocale()
        });

        autocomplete.classList.add("form-location-dialog-map-place-search");

        autocomplete.addEventListener("gmp-select", async (event) => {
            const { placePrediction } = event as GmpSelectEvent;
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ["id", "location"] });
            const accuracy = await getPlaceAccuracy(place.id);

            if (place.location) {
                centerMapOnLocation(place.location);
            }

            clearMarker();
            if (place.location) {
                addMarker(place.location);
            }
            updateLocationFromMarker({ accuracy, updateNameAndAddress: true });
        });

        map.value.controls[google.maps.ControlPosition.TOP_RIGHT]!.push(autocomplete);
    };

    const getPlaceAccuracy = async (placeId: string) => {
        const geocoder = new google.maps.Geocoder();
        try {
            const { results } = await geocoder.geocode({
                placeId: placeId,
                fulfillOnZeroResults: true
            });
            if (!results || !results[0]) {
                throw google.maps.GeocoderStatus.UNKNOWN_ERROR;
            }
            return convertGoogleGeocoderResultToLocationAccuracy(results[0]);
        } catch (error) {
            displayGeocodingError(error);
        }
        return LocationAccuracy.VeryLow; // fallback accuracy in case of error
    };

    const displayGeocodingError = (error: unknown) => {
        const status = error as google.maps.GeocoderStatus;
        showMessage({
            type: FloatingMessageType.Error,
            text: [
                t("locations.errors.Geocoding failed"),
                status.toString()
            ].join(": ")
        });
    };
    return {
        initializeMap
    };

};

