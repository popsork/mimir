export const getTableColumnNumberRenderFunction = (column: TableColumnKey, definition: TableColumnDefinition) => {
    // needed to make TS understand the types
    if (definition.type !== "number") {
        return undefined;
    }

    const columnKey = column.key as keyof OrderRow;
    const formatRule = definition.numberFormat ?? "normal";
    const formatter = new Intl.NumberFormat(getCurrentLocale(), {
        style: formatRule === "currency" ? "currency" : "decimal",
        maximumFractionDigits: definition.decimals,
        currency: "SEK", // currently hardcoded and needs to be discussed in TMS-1534 where this setting should live
        useGrouping: false,
    });

    return (rowData: OrderRow) => {
        // typecasting needed for parseFloat
        const numberString = rowData[columnKey] as string | null | undefined;
        if (!numberString) {
            return "";
        }

        const numberValue = parseFloat(numberString);
        if (isNaN(numberValue)) {
            return numberString;
        }

        return formatter.format(numberValue);
    };
};
