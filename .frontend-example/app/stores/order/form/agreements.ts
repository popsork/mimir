import type { Collection } from "pinia-orm";
import { Agreement, type AgreementApiResponseResource } from "~/models/Agreement";

export const useOrderFormAgreementsStore = defineStore("order-form-agreements", () => {
    const model = Agreement;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormAgreements;

    const waitStore = useWaitStore();

    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const customerId = computed(() => {
        return form.value.order.customerId;
    });

    const agreements = computed(() => {
        if (customerId.value === null) {
            return [] as Collection<Agreement>;
        }
        return repo.where("customerId", customerId.value).orderBy("sequenceNumber").get();
    });

    watch(customerId, () => {
        reset();
        loadCustomerAgreements();
    });

    const loadCustomerAgreements = async () => {
        const id = customerId.value;
        if (id === null) {
            return;
        }
        const waiterParams = { customerId: id };

        waitStore.start(waiterName, waiterParams);
        try {
            const records = await fetchRecords();
            if (customerId.value !== id) {
                // this response is not to the current/latest customer id, so discard it
                return;
            }

            repo.flush();
            repo.insert(records);
        } finally {
            waitStore.end(waiterName, waiterParams);
        }
    };

    const waitingForAgreements = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        if (!customerId.value) {
            return [];
        }

        const apiResponse: { data: AgreementApiResponseResource[] } = await useApi().getAgreements({
            customerId: customerId.value
        });

        const records = apiResponse.data.map((resource, index) => {
            const record = model.fromApiResponse(resource);
            record.sequenceNumber = index + 1;
            return record;
        });

        return records;
    });

    const reset = () => {
        repo.flush();
    };

    return {
        agreements,
        loadCustomerAgreements,
        waitingForAgreements,
    };
});

