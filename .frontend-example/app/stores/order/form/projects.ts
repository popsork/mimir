import type { Collection } from "pinia-orm";
import { Project, type ProjectApiResponseResource } from "~/models/Project";

export const useOrderFormProjectsStore = defineStore("order-form-projects", () => {
    const model = Project;
    const repo = useRepo(model);
    const waiterName = WaitingFor.OrderFormProjects;

    const waitStore = useWaitStore();

    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const customerId = computed(() => {
        return form.value.order.customerId;
    });

    const projects = computed(() => {
        if (customerId.value === null) {
            return [] as Collection<Project>;
        }
        return repo.orderBy("name").get();
    });

    watch(customerId, () => {
        reset();
        loadCustomerProjects();
    });

    const loadCustomerProjects = async () => {
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

    const waitingForProjects = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        if (!customerId.value) {
            return [];
        }

        const apiResponse: { data: ProjectApiResponseResource[] } = await useApi().getProjects({
            customerId: customerId.value
        });

        return apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });
    });

    const reset = () => {
        repo.flush();
    };

    return {
        projects,
        loadCustomerProjects,
        waitingForProjects,
        reset
    };
});
