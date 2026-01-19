import type { Model } from "pinia-orm";

export const useTextFieldValue = <T extends Model, K extends keyof T>(
    { recordAccessor, valueAttribute, manualAttribute }: {
        recordAccessor: () => T | undefined,
        valueAttribute: K,
        manualAttribute?: K,
    }
) => {
    const value = computed({
        get: () => {
            const record = recordAccessor();
            if (!record || typeof record[valueAttribute] !== "string") {
                return null;
            }
            return record[valueAttribute];
        },
        set: (value: string | null) => {
            const record = recordAccessor();
            if (!record) {
                return;
            }

            record[valueAttribute] = value as any;
            if (manualAttribute) {
                valueIsManual.value = true;
            }
        }
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
        valueIsManual
    };
};
