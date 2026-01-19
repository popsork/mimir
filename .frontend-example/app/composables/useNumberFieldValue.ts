import type { Model } from "pinia-orm";


export const useNumberFieldValue = <T extends Model, K extends keyof T>(
    { recordAccessor, valueAttribute, precisionAttribute, precision, manualAttribute, decimalPlaces }: {
        recordAccessor: () => T | undefined,
        valueAttribute: K,
        manualAttribute?: K,
        decimalPlaces?: number,
    } & (
        // either precisionAttribute or precision may be given, but never both
        { precisionAttribute?: K, precision?: never }
        |
        { precisionAttribute?: never, precision?: number }
    )
) => {
    // if a value attribute has a separate precision attribute,
    // it means that the value attribute is always integer
    // and the precision attribute always indicates the amount to divide the value by
    // so value attribute containing 123 with precision attribute 2 would mean 1.23,
    // and if user changes that to 1.2, then it gets stored back as value 12 and precision 1.
    // value 123 with precision 0 would stay as 123 both in the field and in the database

    // precision can be negative, e.g. value attribute 12 and precision -3 would mean 12000
    // and this code technically supports that scenario, but normally that should not be used
    // as there is no need to cut off trailing zeroes from integers
    // so 12000 should be stored as 12000 and precision 0

    // the value getter returns the attribute's value divided by (10 ^ precision)
    // using the precision from either the indicated precisionAttribute or a fixed precision if no attribute exists.

    // and the setter converts the incoming value from the field back to the storable precision
    // and also updates the corresponding precision attribute if it is given
    const value = computed({
        get: () => {
            const record = recordAccessor();
            if (!record || typeof record[valueAttribute] !== "number") {
                return null;
            }

            const factor = Math.pow(10, getCurrentPrecision());
            return record[valueAttribute] / factor;
        },
        set: (value: number | null) => {
            const record = recordAccessor();
            if (!record) {
                return;
            }

            let multiplier: number;

            if (precisionAttribute !== undefined) {
                // when precision attribute is given, it should be updated along with the value
                // and the storable precision can change based on the value entered
                // to always match the exact precision needed to represent the given value
                const settablePrecision = (value === null) ? null : getNumberPrecision(value);
                record[precisionAttribute] = settablePrecision as any;

                multiplier = (value === null) ? 1 : Math.pow(10, settablePrecision!);
            } else {
                // no precision attribute is given,
                // which means that precision is fixed and does not change based on value
                multiplier = Math.pow(10, getCurrentPrecision());
            }

            const settableValue = (value === null) ? null : value * multiplier;
            record[valueAttribute] = settableValue as any;
            valueIsManual.value = true;
        }
    });

    const getCurrentPrecision = (): number => {
        // precision 0 means the value always contains the actual number
        // and does not need to be divided / multiplied by anything in the getters / setters.

        // precision 0 does NOT mean that the value is an integer, it may contain a float
        const defaultPrecision = 0;

        if (precision !== undefined) {
            return precision;
        }

        if (precisionAttribute !== undefined) {
            const record = recordAccessor();
            if (!record || typeof record[precisionAttribute] !== "number") {
                return defaultPrecision;
            }
            return record[precisionAttribute];
        }

        return defaultPrecision;
    };

    // decimal places to allow in the field may be given as an argument,
    // but there are still some calculations that may change the given value
    const calculatedDecimalPlaces = computed(() => {
        // if decimal places are not given, detect them from precision
        const currentPrecision = getCurrentPrecision();
        const expectedDecimalPlaces = (decimalPlaces === undefined) ? currentPrecision : decimalPlaces;

        // if the current precision is larger than given decimal places, then override decimal places argument.
        // this ensures that nothing gets cut off
        // in case a value returned from API has more decimal places than expected
        return Math.max(currentPrecision, expectedDecimalPlaces);
    });

    const valueIsManual = computed({
        get:() => {
            const record = recordAccessor();
            if (!manualAttribute || !record || typeof record[manualAttribute] !== "boolean") {
                return false;
            }
            return record[manualAttribute];
        },
        set: (value: boolean) => {
            const record = recordAccessor();
            if (!manualAttribute || !record) {
                return;
            }
            record[manualAttribute] = value as any;
        }
    });

    return {
        value,
        decimalPlaces: calculatedDecimalPlaces,
        valueIsManual
    };
};
