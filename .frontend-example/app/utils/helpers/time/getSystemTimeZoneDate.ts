import type { TZDate } from "@date-fns/tz";
import { isValid } from "date-fns";

export function getSystemTimeZoneDate(input: Date | string | null): TZDate | null {
    if (input === null || input === "") {
        return null;
    }

    const timeZoneDateConstructor = getSystemTimeZoneConstructor();
    const date = timeZoneDateConstructor(input);

    if (!isValid(date)) {
        return null;
    }

    return date;
}

