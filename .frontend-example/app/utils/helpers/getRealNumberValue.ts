export const getRealNumberValue = (value: number | null, precision: number | null) => {
    if (value === null || precision === null) {
        return null;
    }
    return value / (10 ** precision);
};
