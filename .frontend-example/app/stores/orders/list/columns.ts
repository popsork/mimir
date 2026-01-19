import { OrderListColumn, type OrderListColumnApiResponseResource } from "~/models/OrderListColumn";
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

export const useOrdersListColumnsStore = defineStore("orders-list-columns", () => {
    const model = OrderListColumn;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderListColumns;

    const { t } = useI18n();
    const waitStore = useWaitStore();
    const columns = computed(() => {
        return repo.all();
    });

    const columnsLoaded = ref(false);
    const filterableProperties = computed(() => {
        const backendDefinedKeys = columns.value.map(c => c.key);
        return Object.entries(ORDER_ROW_DEFINITION)
            .filter(([key]) => backendDefinedKeys.includes(key))
            .map(([key, definition]) => ({
                ...definition,
                key,
                label: t("orders.list.columns." + key),
            })) as FilterPropertyDefinition[];
    });

    const fetchColumns = async () => {
        const apiResponse = await useApi().getOrderColumns();
        const apiResponseColumns = await apiResponse.json() as OrderListColumnApiResponseResource[];

        return apiResponseColumns.map((column) => {
            return model.fromApiResponse(column);
        });
    };

    const loadColumns = async () => {
        waitStore.start(waiterName);
        try {
            const columns = await fetchColumns();

            repo.flush();
            repo.insert(columns);

            columnsLoaded.value = true;
        } finally {
            waitStore.end(waiterName);
        }
    };

    const loadColumnsIfNeeded = function() {
        if (columnsLoaded.value || waitStore.isWaitingFor(waiterName)) {
            return;
        }

        loadColumns();
    };

    const getColumnByKey = (key: string): OrderListColumn | null => {
        return repo.find(key);
    };

    return {
        columns,
        columnsLoaded,
        loadColumns,
        loadColumnsIfNeeded,
        getColumnByKey,
        filterableProperties,
    };
});
