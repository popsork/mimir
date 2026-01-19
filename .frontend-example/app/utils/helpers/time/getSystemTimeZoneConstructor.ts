import { tz } from "@date-fns/tz";

export function getSystemTimeZoneConstructor() {
    const { systemTimeZone } = useConfiguration();
    return tz(systemTimeZone!);
}


