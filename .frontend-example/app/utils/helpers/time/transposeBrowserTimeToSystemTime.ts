import { format, parse } from "date-fns";

export function transposeBrowserTimeToSystemTime(browserTime: Date) {
    // several components do not support timezones, and emit values in the browser's timezone.
    // e.g., if something is shown as 1:00 in the UI, it will be emitted as 1:00 in the browser's timezone,
    // while in fact it should mean 1:00 in the system's timezone.

    // to transpose this value:
    // 1) format the value as a naive string, stripping any timezone info (from browser)
    // 2) parse the zone-less string as being in the system's timezone

    const naiveFormat = "yyyy-MM-dd HH:mm:ss";
    const naiveTimeString = format(browserTime, naiveFormat);

    return parse(naiveTimeString, naiveFormat, new Date(), getSystemTimeZoneOptions());
}
