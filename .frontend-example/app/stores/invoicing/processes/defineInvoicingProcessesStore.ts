import { InvoicingProcess, type InvoicingProcessApiResponseResource } from "~/models/InvoicingProcess";
import { InvoicingProcessStep } from "~/models/InvoicingProcessStep";

export function defineInvoicingProcessesStore(
    {
        name,
        active,
    }:
    {
        name: string,
        active: boolean,
    }
) {

    return defineStore(name, () => {

        const model = InvoicingProcess;
        const repo = useRepo(model);
        const stepsRepo = useRepo(InvoicingProcessStep);

        const waiterName = WaitingFor.InvoicingProcesses;

        const waitStore = useWaitStore();

        const records = computed(() => {
            return repo.orderBy("sequenceNumber").with("steps", (query) => {
                return query.orderBy("sequenceNumber");
            }).get();
        });

        const loadRecords = async () => {
            const waiterTimestamp = waitStore.start(waiterName);
            let shouldEndWaiter = false;

            try {
                const records = await fetchRecords();

                const latestWaiterTimestamp = waitStore.getActiveWaiterTimestamp(waiterName);

                if (latestWaiterTimestamp !== waiterTimestamp) {
                    // if a waiter with a different timestamp exists,
                    // or if the waiter has already been ended by another response,
                    // ignore the results for this request
                    return;
                }

                shouldEndWaiter = true;

                clearRecords();

                repo.save(records);
            } finally {
                if (shouldEndWaiter) {
                    waitStore.end(waiterName);
                }
            }
        };

        const waitingForRecords = computed(() => {
            return waitStore.is(waiterName);
        });

        const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
            const apiResponse: { data: InvoicingProcessApiResponseResource[] } = await useApi().getInvoicingProcesses({
                active,
                latestFirst: !active,
                maxNumberOfResults: 100
            });

            const records = apiResponse.data.map((resource, index) => {
                const record = model.fromApiResponse(resource);
                record.sequenceNumber = index + 1;
                return record;
            });

            return records;
        });

        const clearRecords = () => {
            // note that this flushes ALL processes, regardless of statuses.
            // this is fine, as switching between active/finished pages always reloads the records for the page
            repo.flush();
            stepsRepo.flush();
        };

        const reset = () => {
            clearRecords();
        };

        return {
            loadInvoicingProcesses: loadRecords,
            invoicingProcesses: records,
            waitingForInvoicingProcesses: waitingForRecords,
            reset
        };
    });

}
