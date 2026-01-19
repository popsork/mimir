import type { Collection } from "pinia-orm";
import { Contact, type ContactApiResponseResource } from "~/models/Contact";

export const useOrderFormContactsStore = defineStore("order-form-contacts", () => {
    const model = Contact;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormContacts;

    const waitStore = useWaitStore();

    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const customerId = computed(() => {
        return form.value.order.customerId;
    });

    const contacts = computed(() => {
        if (customerId.value === null) {
            return [] as Collection<Contact>;
        }
        return repo.where("customerId", customerId.value).orderBy("sequenceNumber").get();
    });

    watch(customerId, () => {
        reset();
        loadCustomerContacts();
    });

    const loadCustomerContacts = async () => {
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

    const waitingForContacts = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        if (!customerId.value) {
            return [];
        }

        const apiResponse: { data: ContactApiResponseResource[] } = await useApi().getContacts({
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
        contacts,
        loadCustomerContacts,
        waitingForContacts,
        reset
    };
});

