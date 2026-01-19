export function localizeDistance(distanceInKilometres: number) {

    const { $i18n } = useNuxtApp();
    const t = $i18n.t;
    const unitLabel = t("general.units.km");

    return [
        localizeNumber(distanceInKilometres),
        "\u00A0", // non-breaking space
        unitLabel
    ].join("");
}
