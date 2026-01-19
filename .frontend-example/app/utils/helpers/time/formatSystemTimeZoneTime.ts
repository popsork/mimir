import type { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export function formatSystemTimeZoneTime(
    date: Date | TZDate | string | null,
    options?: {
        includeDate?: boolean,
        includeTime?: boolean,
        includeSeconds?: boolean,
    }
) {
    const systemTimeZoneDate = getSystemTimeZoneDate(date);
    if (!systemTimeZoneDate) {
        return null;
    }
    const includeDate = options?.includeDate ?? true;
    const includeTime = options?.includeTime ?? true;
    const includeSeconds = options?.includeSeconds ?? false;

    if (!includeDate && !includeTime) {
        return null;
    }

    const formatParts = [];
    if (includeDate) {
        formatParts.push("yyyy-MM-dd");
    }
    if (includeTime) {
        formatParts.push((includeSeconds) ? "HH:mm:ss" : "HH:mm");
    }

    return format(systemTimeZoneDate, formatParts.join(" "));
}
