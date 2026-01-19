import { DeviationCause } from "~/models/DeviationCause";
import { DeviationType, type DeviationTypeApiResponseResource } from "~/models/DeviationType";
import { DeviationTypeCause } from "~/models/DeviationTypeCause";

// causes are fully dependent on types, so they are always loaded together by including causes with the types list

export const useOrderFormDeviationTypesAndCausesStore = defineStore("order-form-deviation-types-and-causes", () => {
    const model = DeviationType;
    const repo = useRepo(model);
    const causeRepo = useRepo(DeviationCause);
    const causeRelationsRepo = useRepo(DeviationTypeCause);

    const waiterName = WaitingFor.OrderFormDeviationTypes;

    const waitStore = useWaitStore();

    const recordsLoaded = ref(false);

    const records = computed(() => {
        return repo.orderBy("sequenceNumber").get();
    });

    const loadRecordsIfNeeded = () => {
        if (recordsLoaded.value || waitStore.isWaitingFor(waiterName)) {
            return;
        }
        loadRecords();
    };

    const loadRecords = async () => {
        waitStore.start(waiterName);
        try {
            const records = await fetchRecords();

            reset();
            repo.insert(records.types);
            causeRepo.insert(records.causes);
            causeRelationsRepo.insert(records.causeRelations);

            recordsLoaded.value = true;
        } finally {
            waitStore.end(waiterName);
        }
    };

    const waitingForRecords = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        const apiResponse: { data: DeviationTypeApiResponseResource[] } = await useApi().getDeviationTypes();

        const types = [] as DeviationType[];
        const causes = [] as DeviationCause[];
        const causeRelations = [] as DeviationTypeCause[];

        apiResponse.data.forEach((typeResource, typeIndex) => {
            const deviationType = model.fromApiResponse(typeResource);
            deviationType.sequenceNumber = typeIndex + 1;
            types.push(deviationType);

            const causeResources = typeResource.deviationCauses?.data || [];
            causeResources.forEach((causeResource, causeIndex) => {
                const cause = DeviationCause.fromApiResponse(causeResource);
                if (!causes.some(c => c.id === cause.id)) {
                    causes.push(cause);
                }

                const relation = new DeviationTypeCause({
                    typeId: deviationType.id,
                    causeId: cause.id,
                    sequenceNumber: causeIndex + 1
                });
                causeRelations.push(relation);
            });
        });

        return {
            types,
            causes,
            causeRelations
        };
    });

    const getDeviationCausesForDeviationType = (deviationType: DeviationType) => {
        // fetching relationships from the repo instead of using deviationType.causes
        // because the relationships need to be ordered by sequenceNumber
        return useRepo(DeviationTypeCause)
            .where("typeId", deviationType.id)
            .orderBy("sequenceNumber")
            .get()
            .map(relation => {
                const cause = causeRepo.find(relation.causeId);
                if (!cause) {
                    return null;
                }
                return cause;
            })
            .filter(cause => cause !== null);
    };

    const reset = () => {
        causeRelationsRepo.flush();
        causeRepo.flush();
        repo.flush();
        recordsLoaded.value = false;
    };

    return {
        loadDeviationTypesAndCausesIfNeeded: loadRecordsIfNeeded,
        deviationTypes: records,
        waitingForDeviationTypes: waitingForRecords,
        getDeviationCausesForDeviationType,

    };
});

