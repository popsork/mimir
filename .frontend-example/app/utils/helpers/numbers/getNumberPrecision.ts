export const getNumberPrecision = (value: number): number => {
    // this returns the number of decimal places needed to represent the given value
    // so 1.23 would return 2, 1.2345 would return 4, 1 would return 0 etc

    return (value.toString().split(".")[1] || "").length;
};
