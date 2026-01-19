import type { TZDate } from "@date-fns/tz";
import { differenceInMinutes } from "date-fns";

export function getTimeDifferenceInMinutes(laterDate: Date | TZDate | string | null, earlierDate: Date | TZDate | string | null): number | null {
    const laterSystemDate = getSystemTimeZoneDate(laterDate);
    const earlierSystemDate = getSystemTimeZoneDate(earlierDate);

    if (laterSystemDate === null || earlierSystemDate === null) {
        return null;
    }

    return differenceInMinutes(laterSystemDate, earlierSystemDate);
}
