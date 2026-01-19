import { format } from "date-fns";

export const formatTableColumnFilterValue = (value: string | null | number | boolean, definition: FilterConditionDefinition) => {
    if (!value) {
        return "";
    }

    if (definition.type !== "date") {
        return value;
    }

    // as we want to display the dates the system timezone,
    // we parse it and converts to that timezone
    const date = getSystemTimeZoneDate(value as string);
    if (!date) {
        return value;
    }

    return format(date, "yyyy-MM-dd");
};
