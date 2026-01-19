export const parseLocalizedNumber = (string: string): number | null => {
    // parsing always accepts both commas and periods as decimal separators, and ignores all spaces
    const stringValue = string.replace(/\s/g, "").replace(/,/g, ".");
    if (/^-?\d+(\.(\d+)?)?$/.test(stringValue)) {
        return Number(stringValue);
    }
    return stringValue === "" ? null : Number.NaN;
};
