export function localizeDuration(durationInMinutes: number) {
    const { $i18n } = useNuxtApp();
    const t = $i18n.t;

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
        const hoursPart = [
            localizeNumber(hours),
            "\u00A0", // non-breaking space
            t("general.units.h")
        ].join("");
        parts.push(hoursPart);
    }

    const minutesPart = [
        localizeNumber(minutes),
        "\u00A0", // non-breaking space
        t("general.units.min")
    ].join("");
    parts.push(minutesPart);

    return parts.join("\u00A0");
}
