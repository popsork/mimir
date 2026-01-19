import type { Model } from "pinia-orm";

export const useDateFieldValue = <T extends Model, K extends keyof T>(
    { recordAccessor, field }: {
        recordAccessor: () => T | undefined,
        field: K,
    }
) => {
    const value = computed({
        get: () => {
            const record = recordAccessor();
            if (
                !record ||
                typeof record[field] !== "string" ||
                !record[field].match(/^\d{4}-\d{2}-\d{2}$/) || // ensure YYYY-MM-DD format
                isNaN(new Date(record[field]).getTime()) // ensure correctly formatted but invalid dates don't get through
            ) {
                return null;
            }

            return record[field];
        },
        set: (value: string | null) => {
            const record = recordAccessor();
            if (!record) {
                return;
            }

            record[field] = value as any;
        }
    });

    return {
        value
    };
};
