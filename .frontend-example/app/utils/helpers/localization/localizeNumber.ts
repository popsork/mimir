
export const localizeNumber = (
    number: number | null,
    {
        minimumFractionDigits,
        maximumFractionDigits
    }: {
        minimumFractionDigits?: number,
        maximumFractionDigits?: number,
    } = {}
) => {
    if (number === null) {
        return null;
    }

    const localizationOptions = {
        // prevent grouping by thousands, regardless of locale, to avoid confusion with commas
        useGrouping: false,
    } as Intl.NumberFormatOptions;


    localizationOptions.minimumFractionDigits = (minimumFractionDigits !== undefined) ? minimumFractionDigits : 0;

    // some maximum must be set, otherwise it defaults to 3
    localizationOptions.maximumFractionDigits = (maximumFractionDigits !== undefined) ? maximumFractionDigits : 100;

    const string = number.toLocaleString(getCurrentLocale(), localizationOptions);

    // formatting does not fully rely on the current locale,
    // and forces comma as decimal separator, even for English.
    // this is so that commas can be used in fields in the English locale as well.
    return string.replace(/\./g, ",");
};
