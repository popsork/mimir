import type { TZDate } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";

export function getUtcDatetimeString(input: Date | TZDate | string | null): string | null {
    if (input === null || input === "") {
        return null;
    }

    const utcDate = new UTCDate(input);

    return utcDate.toISOString();
}

