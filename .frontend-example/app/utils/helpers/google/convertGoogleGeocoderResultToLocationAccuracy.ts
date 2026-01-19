export function convertGoogleGeocoderResultToLocationAccuracy(result: google.maps.GeocoderResult | undefined) {
    const locationType = result?.geometry?.location_type;
    const partialMatch = !!result?.partial_match;

    let accuracy: LocationAccuracy;
    switch (locationType) {
        case google.maps.GeocoderLocationType.ROOFTOP:
            accuracy = LocationAccuracy.High;
            break;
        case google.maps.GeocoderLocationType.RANGE_INTERPOLATED:
            accuracy = LocationAccuracy.Moderate;
            break;
        case google.maps.GeocoderLocationType.GEOMETRIC_CENTER:
            accuracy = LocationAccuracy.Low;
            break;
        case google.maps.GeocoderLocationType.APPROXIMATE:
        default:
            accuracy = LocationAccuracy.VeryLow;
    }

    // if the result is a partial match, downgrade the accuracy by one level
    if (partialMatch) {
        switch (accuracy) {
            case LocationAccuracy.High:
                accuracy = LocationAccuracy.Moderate;
                break;
            case LocationAccuracy.Moderate:
                accuracy = LocationAccuracy.Low;
                break;
            case LocationAccuracy.Low:
                accuracy = LocationAccuracy.VeryLow;
                break;
            case LocationAccuracy.VeryLow:
                // no change
                break;
        }
    }
    return accuracy;
}
