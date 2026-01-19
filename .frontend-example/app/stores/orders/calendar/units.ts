import { CalendarUnit } from "~/models/calendar/Unit";
import { Unit, type UnitApiResponseResource } from "~/models/Unit";

export const useOrdersCalendarUnitsStore = defineStore("orders-calendar-units", () => {
    const repo = useRepo(CalendarUnit);
    const calendarViewsStore = useOrdersCalendarViewsStore();
    const { selectedView } = storeToRefs(calendarViewsStore);

    // this computed contains the *ordered* list of selected unit ids for the current selected calendar view
    // and it is directly bound to the draggable component, so that it gets updated when the user is reordering the list.
    const selectedViewUnitIds = computed({
        get() {
            if (!selectedView.value) {
                return [];
            }

            if (!selectedView.value.config.unitIds) {
                selectedView.value.config.unitIds = [];
            }

            return selectedView.value.config.unitIds;
        },

        set(unitIds) {
            if (!selectedView.value) {
                return;
            }

            selectedView.value.config.unitIds = unitIds;
        }
    });

    const addUnit = (id: string) => {
        if (!selectedViewUnitIds.value.includes(id)) {
            selectedViewUnitIds.value.push(id);
        }
    };

    const removeUnit = (id: string) => {
        removeUnits([id]);
    };

    const removeUnits = (ids: string[]) => {
        // loaded calendar unit records do not get removed from the repo when they are removed from the selected list.
        // only the list of ids gets updated.
        // this is to avoid having to re-fetch the unit data if the same unit id appears again (e.g. in a different view)
        if (ids.length < 1) {
            return;
        }
        selectedViewUnitIds.value = selectedViewUnitIds.value.filter(unitId => !ids.includes(unitId));
    };


    const loadMissingUnits = async () => {
        const neededUnitIds = selectedViewUnitIds.value;
        if (neededUnitIds.length < 1) {
            return;
        }

        const existingUnitIds = repo.whereId(neededUnitIds).get().map((record: CalendarUnit) => record.id);

        const loadableUnitIds = neededUnitIds.filter(id => !existingUnitIds.includes(id));

        const fetchedUnits = await Promise.all(loadableUnitIds.map(unitId => fetchUnit(unitId)));

        const insertableUnits = fetchedUnits.filter(unit => unit !== null);
        repo.insert(insertableUnits);

        const failedUnitIds = loadableUnitIds.filter(id => !insertableUnits.find(unit => unit!.id === id));
        removeUnits(failedUnitIds);
    };

    const fetchUnit = wrapFunctionInApiErrorHandler(async (unitId) => {
        let apiResponse: any;

        try {
            apiResponse = await useApi().getUnit(unitId);
        } catch (error) {
            if (error?.isAxiosError && error.response?.status === HttpStatus.NotFound) {
                return null;
            } else {
                throw error;
            }
        }

        if (!apiResponse || !apiResponse.data) {
            return null;
        }

        const unit = Unit.fromApiResponse(apiResponse.data as UnitApiResponseResource);
        return CalendarUnit.fromUnit(unit);
    });

    watch(selectedViewUnitIds, () => {
        loadMissingUnits();
    }, { immediate: true, deep: true });

    const selectedViewUnits = computed(() => {
        return selectedViewUnitIds.value.map(id => getUnitById(id)).filter(unit => unit !== null);
    });

    const getUnitById = (id: string) => {
        return repo.find(id) || null;
    };

    return {
        selectedViewUnitIds,
        selectedViewUnits,

        getUnitById,
        addUnit,
        removeUnit,
    };
});
