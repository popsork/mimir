export const getTableColumnEnumRenderFunction = (column: TableColumnKey, definition: TableColumnDefinition) => {
    // needed to make TS understand the types
    if (definition.type !== "enum") {
        return undefined;
    }

    // nuxt does not allow using useI18n() in here for some reason, need to go via useNuxtApp().
    const { $i18n } = useNuxtApp();
    const t = $i18n.t;
    const columnKey = column.key as keyof OrderRow;

    return (rowData: OrderRow) => {
        // typecasting needed for parseFloat
        const enumValue = rowData[columnKey] as string | null | undefined;
        if (!enumValue) {
            return "";
        }

        return t(`${definition.translationScope}.${enumValue}`);
    };
};
