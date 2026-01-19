import { format } from "date-fns";
import type { TZDate } from "@date-fns/tz";

export function getTimePeriodText(start: Date | TZDate | string | null, end: Date | TZDate | string | null) {
    if (start === null || end === null) {
        return "";
    }
    const timeZoneOptions = getSystemTimeZoneOptions();
    const startDateText = format(start, "dd MMM", timeZoneOptions);
    const endDateText = format(end, "dd MMM", timeZoneOptions);

    const startTimeText = format(start, "HH:mm", timeZoneOptions);
    const endTimeText = format(end, "HH:mm", timeZoneOptions);

    if (startDateText === endDateText) {
        return `${startDateText} ${startTimeText} - ${endTimeText}`;
    }
    return `${startDateText} ${startTimeText} - ${endDateText} ${endTimeText}`;
}
