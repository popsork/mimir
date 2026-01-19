import { format } from "date-fns";

export function transposeSystemTimeToBrowserTime(systemTime: Date) {
    // several components do not support timezones, and expect values in the browser's timezone.
    // e.g., if something needs to be shown as 1:00 in the UI, it needs to be passed in as 1:00 in the browser's timezone,
    // while in fact it should mean 1:00 in the system's timezone.

    // to transpose this value (from system to browser:
    // 1) format the value as a naive string using the system's timezone, stripping any timezone indications
    // 2) parse the zone-less string as being in the browser's timezone

    const naiveFormat = "yyyy-MM-dd HH:mm:ss";
    const naiveTimeString = format(systemTime, naiveFormat, getSystemTimeZoneOptions());

    return new Date(naiveTimeString);
}
