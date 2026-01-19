import { startOfDay, endOfDay } from "date-fns";
import type { Collection } from "pinia-orm";
import { BlockedTimePeriod, type BlockedTimePeriodApiResponseResource } from "~/models/BlockedTimePeriod";

export const useOrdersCalendarBlockedTimePeriodsStore = defineStore("orders-calendar-blocked-time-periods", () => {
    const repo = useRepo(BlockedTimePeriod);
    const waiterName = WaitingFor.OrdersCalendarBlockedTimePeriods;

    const waitStore = useWaitStore();

    const unitsStore = useOrdersCalendarUnitsStore();
    const { selectedViewUnitIds } = storeToRefs(unitsStore);

    watch(selectedViewUnitIds, () => {
        // this cleans up the repo in case a unit gets removed (or a different view gets selected that changes the unit list
        removeUnneededRecords();

        // it's ok to load records even when new units have not been added - will serve as an additional data refresh
        loadRecordsIfNeeded();
    }, { deep: true });


    const parametersStore = useOrdersCalendarParametersStore();
    const { firstDate, lastDate, numberOfDays } = storeToRefs(parametersStore);

    watch(firstDate, () => {
        loadRecordsIfNeeded();
    });

    watch(numberOfDays, (newValue, oldValue) => {
        if (newValue > oldValue) {
            // only load records if range has been extended, not shortened
            loadRecordsIfNeeded();
        }
    });

    const loadRecordsIfNeeded = () => {
        if (selectedViewUnitIds.value.length < 1) {
            return;
        }
        loadRecords();
    };

    const removeUnneededRecords = () => {
        repo.whereNotIn("unitId", selectedViewUnitIds.value).delete();
    };

    const loadRecords = async () => {
        waitStore.start(waiterName);

        try {
            const records = await fetchRecords();

            repo.insert(records);

            // no need to remove previously loaded records which are out of the currently selected date range.
            // they will get refetched if the range is extended again, but they will already be shown while the refetch is in progress
        } finally {
            waitStore.end(waiterName);
        }
    };

    const fetchRecords = async () => {
        const fromBrowserTime = startOfDay(firstDate.value);
        const tillBrowserTime = endOfDay(lastDate.value);

        const fromSystemTime = transposeBrowserTimeToSystemTime(fromBrowserTime);
        const tillSystemTime = transposeBrowserTimeToSystemTime(tillBrowserTime);

        const from = getSystemTimeZoneDatetimeString(fromSystemTime);
        const till = getSystemTimeZoneDatetimeString(tillSystemTime);

        const parameters = {
            unitIds: selectedViewUnitIds.value,
            from,
            till
        };

        const apiResponse: { data: BlockedTimePeriodApiResponseResource[] } = await useApi().getBlockedTimePeriods(parameters);

        const records = apiResponse.data.map(resource => {
            const record = BlockedTimePeriod.fromApiResponse(resource);
            return record;
        });

        return records;
    };

    const loadedBlockedTimePeriods = computed(() => {
        return repo.all() as Collection<BlockedTimePeriod>;
    });

    const getRecordsForUnit = (unitId: string) => {
        return repo.where("unitId", unitId).get() as Collection<BlockedTimePeriod>;
    };

    const getRecordById = (id: string) => {
        return repo.find(id) as BlockedTimePeriod | null;
    };

    const addNewRecord = wrapFunctionInApiErrorHandler(async (
        { unitId, reasonId, startsAt, endsAt }:
        { unitId: string, reasonId: string, startsAt: Date, endsAt: Date }
    ) => {
        const creatableRecord = buildBlockedTimePeriod( { unitId, reasonId, startsAt, endsAt } );

        try {
            waitStore.start(WaitingFor.OrdersCalendarBlockedTimePeriodCreation);
            const response = await useApi().createBlockedTimePeriod(creatableRecord);
            const createdRecord = BlockedTimePeriod.fromApiResponse(response.data as BlockedTimePeriodApiResponseResource);
            repo.save(createdRecord);
            return true;
        } finally {
            waitStore.end(WaitingFor.OrdersCalendarBlockedTimePeriodCreation);
        }
    });

    const buildBlockedTimePeriod = (
        { unitId, reasonId, startsAt, endsAt }:
        { unitId: string, reasonId: string, startsAt: Date, endsAt: Date }
    ) => {
        const record = BlockedTimePeriod.buildBlank();

        record.unitId = unitId;
        record.reasonId = reasonId;
        record.startsAt = getUtcDatetimeString(startsAt);
        record.endsAt = getUtcDatetimeString(endsAt);

        return record;
    };

    const removeRecord = wrapFunctionInApiErrorHandler(async (id: string) => {
        try {
            waitStore.start(WaitingFor.OrdersCalendarBlockedTimePeriodRemoval);
            await useApi().destroyBlockedTimePeriod(id);
            repo.destroy(id);
        } finally {
            waitStore.end(WaitingFor.OrdersCalendarBlockedTimePeriodRemoval);
        }
    });

    const updateRecordTimes = ({ id, startsAt, endsAt } : { id: string, startsAt: string, endsAt: string }) => {
        // update in repo immediately without waiting for the API call to complete
        // therefore also no waiter is used here
        repo.save({ id, startsAt, endsAt });
        updateRecordTimesInApi({ id, startsAt, endsAt });
    };

    const updateRecordTimesInApi = wrapFunctionInApiErrorHandler(async (
        { id, startsAt, endsAt }:
        { id: string, startsAt: string, endsAt: string }
    ) => {
        const partialResource = BlockedTimePeriod.buildTimesUpdateApiRequestResource({ id, startsAt, endsAt });

        // there are no valid error response scenarios, so there is no try/catch to silence any errors
        await useApi().updateBlockedTimePeriod(partialResource);
        return true;
    });

    return {
        loadRecordsIfNeeded,
        loadedBlockedTimePeriods,
        getRecordsForUnit,
        getRecordById,
        updateRecordTimes,
        addNewRecord,
        removeRecord
    };
});
