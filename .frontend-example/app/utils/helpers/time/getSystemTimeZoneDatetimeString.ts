import type { TZDate } from "@date-fns/tz";

export function getSystemTimeZoneDatetimeString(input: Date | TZDate | string | null): string | null {
    const date = getSystemTimeZoneDate(input);
    if (!date) {
        return null;
    }

    // milliseconds need to be removed because they are not supported by the API
    const formattedWithMilliseconds = date.toISOString();
    const formattedWithoutMilliseconds = formattedWithMilliseconds.replace(/\.\d{3}/, "");

    return formattedWithoutMilliseconds;
}

