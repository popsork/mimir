import type { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export function getSystemTimeZoneDateString(input: Date | TZDate | string | null): string | null {
    const date = getSystemTimeZoneDate(input);
    if (!date) {
        return null;
    }

    return format(date, "yyyy-MM-dd");
}
