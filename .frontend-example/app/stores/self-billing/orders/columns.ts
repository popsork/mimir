import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";
import {
    SelfBillingOrderColumn,
    type SelfBillingOrderColumnApiResponseResource
} from "~/models/SelfBillingOrderColumn";

export const useSelfBillingOrdersColumnsStore = defineStore("self-billing-orders-columns", () => {
    const model = SelfBillingOrderColumn;
    const repo = useRepo(model);
    const waiterName = WaitingFor.SelfBillingOrderColumns;

    const { t } = useI18n();
    const waitStore = useWaitStore();
    const columns = computed(() => {
        return repo.all();
    });

    const columnsLoaded = ref(false);
    const filterableProperties = computed(() => {
        const backendDefinedKeys = columns.value.map(c => c.key);
        return Object.entries(SELF_BILLING_ORDER_ROW_DEFINITION)
            .filter(([key]) => backendDefinedKeys.includes(key))
            .map(([key, definition]) => ({
                ...definition,
                key,
                label: t("self_billing.orders.columns." + key),
            })) as FilterPropertyDefinition[];
    });

    const fetchColumns = async () => {
        const apiResponse = await useApi().getSelfBillingOrderColumns();
        const apiResponseColumns = await apiResponse.json() as SelfBillingOrderColumnApiResponseResource[];

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

    const getColumnByKey = (key: string): SelfBillingOrderColumn | null => {
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
