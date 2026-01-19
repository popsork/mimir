export const getTableColumnBooleanRenderFunction = (column: TableColumnKey, definition: TableColumnDefinition) => {
    // needed to make TS understand the types
    if (definition.type !== "boolean") {
        return undefined;
    }

    // nuxt does not allow using useI18n() in here for some reason, need to go via useNuxtApp().
    const { $i18n } = useNuxtApp();
    const t = $i18n.t;
    const columnKey = column.key as keyof OrderRow;

    return (rowData: OrderRow) => {
        let boolValue = rowData[columnKey] as string | null | undefined | boolean;
        if (boolValue === "" || boolValue === null || typeof boolValue === "undefined") {
            return "";
        }

        if (typeof boolValue === "string") {
            boolValue = (boolValue === "true");
        }

        return t(`general.boolean.${boolValue + ""}`);
    };
};
