import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

export const useOrderTemplatesColumnsStore = defineStore("order-templates-columns", () => {
    const columns = computed(() => getAvailableColumns());
    // nuxt does not allow using useI18n() composable here for some reason, need to go via useNuxtApp().
    // this is probably because of where this store gets initialized in the app lifecycle.
    const { $i18n } = useNuxtApp();
    const t = $i18n.t;

    const getAvailableColumns = () => {
        return Object.keys(ORDER_TEMPLATE_ROW_DEFINITION).map(key => ({
            key: key,
            columnType: TableColumnType.Text,
            sortable: true,
            weight: 1,
        })) as OrderTemplateColumn[];
    };

    const filterableProperties = computed(() => {
        return Object.entries(ORDER_TEMPLATE_ROW_DEFINITION)
            .map(([key, definition]) => ({
                ...definition,
                key,
                label: t("order_templates.list.columns." + key),
            })) as FilterPropertyDefinition[];
    });

    const getColumnByKey = (key: string): OrderTemplateColumn | null => {
        return columns.value.find(c => c.key === key) || null;
    };

    return {
        columns,
        filterableProperties,
        getColumnByKey,
    };
});
