export function localizeCurrencyAmount(amountInMajorUnits: number, { unlimitedPrecision = false }: { unlimitedPrecision?: boolean } = {}) {
    const maximumFractionDigits = unlimitedPrecision ? undefined : 2;

    return [
        localizeNumber(amountInMajorUnits, { minimumFractionDigits: 2, maximumFractionDigits }),
        "\u00A0", // non-breaking space
        "SEK"
    ].join("");
}
