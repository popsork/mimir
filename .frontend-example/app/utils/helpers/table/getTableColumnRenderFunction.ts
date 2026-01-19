export type TableColumnKey = {
    key: string,
};

export const getTableColumnRenderFunction = (column: TableColumnKey, definitions: Record<string, TableColumnDefinition>) => {
    const columnKey = column.key as string;
    const definition = definitions[columnKey];
    if (!definition) {
        return undefined;
    }

    if (definition.type === "date") {
        return getTableColumnDateRenderFunction(column, definition);
    }

    if (definition.type === "number") {
        return getTableColumnNumberRenderFunction(column, definition);
    }

    if (definition.type === "enum") {
        return getTableColumnEnumRenderFunction(column, definition);
    }

    if (definition.type === "boolean") {
        return getTableColumnBooleanRenderFunction(column, definition);
    }

    return undefined;
};
