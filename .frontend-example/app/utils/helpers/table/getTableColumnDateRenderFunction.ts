import { format } from "date-fns";

export const getTableColumnDateRenderFunction = (column: TableColumnKey, definition: TableColumnDefinition) => {
    // needed to make TS understand the types
    if (definition.type !== "date") {
        return undefined;
    }

    const columnKey = column.key as keyof OrderRow;
    const formatRule = definition.timeFormat || "normal";

    return (rowData: OrderRow) => {
        // typecasting needed for Date-construct
        const dateValue = rowData[columnKey] as string | null | undefined;
        if (!dateValue) {
            return "";
        }

        // as we want to display the dates the system timezone,
        // we parse it and converts to that timezone
        const date = getSystemTimeZoneDate(dateValue);
        if (!date) {
            return dateValue;
        }

        return format(date, "yyyy-MM-dd" + getTimeFormat(date, formatRule));
    };
};

const getTimeFormat = (date: Date, formatRule: TimeFormatRule) => {
    if (formatRule === "normal" && isStartOfDay(date)) {
        return "";
    }

    if (formatRule === "delivery" && (isEndOfDay(date) || isStartOfDay(date))) {
        return "";
    }

    return " HH:mm";
};

const isStartOfDay = (date: Date) => date.getHours() === 0 && date.getMinutes() === 0;
const isEndOfDay = (date: Date) => date.getHours() === 23 && date.getMinutes() === 59;
