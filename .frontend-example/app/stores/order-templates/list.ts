import { OrderTemplate } from "~/models/OrderTemplate";
import type { CustomerOrderApiResponseResource } from "~/models/CustomerOrder";
import Sylvie from "sylviejs";
import type { Collection } from "sylviejs/database/collection/collection";
import { Type } from "pinia-orm";

export const useOrderTemplatesListStore = defineStore("order-templates-list", () => {
    const model = OrderTemplate;
    const db = new Sylvie("order-templates-list-db");
    const collection = shallowRef(
        db.addCollection("order-templates", {
            unique: ["id"]
        }) as Collection<OrderTemplateRow>
    );

    const waiterName = WaitingFor.OrderTemplates;
    const waitStore = useWaitStore();

    const convertOrderTemplateToOrderTemplateRow = (orderTemplate: OrderTemplate) => {
        const template = {} as Record<string, any>;

        for (const [key, field] of Object.entries(OrderTemplate.fields())) {
            //
            // scalar field types all inherit from "Type"
            // so everything not inherited from that will be skipped
            // i.e. relations
            if (!(field instanceof Type)) {
                continue;
            }

            template[key] = orderTemplate[key as (keyof OrderTemplate)];
        }

        return template as OrderTemplateRow;
    };

    const loadRecords = async () => {
        if (waitStore.isWaitingFor(waiterName)) {
            return;
        }

        waitStore.start(waiterName);
        try {
            const records = await fetchRecords();

            clearRecords();

            collection.value.insert(
                records.map(orderTemplate => convertOrderTemplateToOrderTemplateRow(orderTemplate))
            );

            triggerRef(collection);
        } finally {
            waitStore.end(waiterName);
        }
    };

    const waitingForRecords = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();

        const apiResponse: { data: CustomerOrderApiResponseResource[] } = await apiClient.getOrderTemplates();

        return apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });
    });

    const clearRecords = () => {
        collection.value.clear();
        triggerRef(collection);
    };

    const reset = () => {
        clearRecords();
    };

    return {
        loadTemplates: loadRecords,
        waitingForTemplates: waitingForRecords,
        reset,
        collection,
    };
});
