import type { TZDate } from "@date-fns/tz";
import { add, type Duration } from "date-fns";

export function addToSystemTimeZoneDate(input: TZDate | null, duration: Duration): TZDate | null {
    if (input === null) {
        return null;
    }
    const adjustedDate = add(input, duration);
    const timeZoneDateConstructor = getSystemTimeZoneConstructor();
    const result = timeZoneDateConstructor(adjustedDate);
    return result;
}
