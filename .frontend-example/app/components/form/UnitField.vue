<template lang="pug">
FormSelectField(
    ref="field"
    v-model="unitId"
    name="unit"
    size="large"
    :label="label"
    :errors="errors"
    :options="options"
    :filterable="true"
    :remote="true"
    :loading="waitingForSearch"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
)
</template>
<script setup lang="ts">
import type { Unit } from "~/models/Unit";

const props = defineProps<{
    label: string,
    errors: FormFieldError[],
    showUnitState: boolean,
}>();

const unitsStore = useUnitsStore();
unitsStore.reset();

const { units, searchQuery } = storeToRefs(unitsStore);

const unitModel = defineModel<Unit | null>({ required: true });

const unitId = computed({
    get: () => unitModel.value?.id ?? null,
    set: (id) => {
        let unit: Unit | null = null;
        if (id) {
            if (unitModel.value?.id === id) {
                unit = unitModel.value;
            } else {
                unit = units.value.find((unit) => unit.id === id) ?? null;
            }
        }
        unitModel.value = unit;
    }
});

const fieldIdentifier = "unit-field";

const { t } = useI18n();

const options = computed(() => {
    return buildSelectOptions({
        collection: units.value,
        currentObject: unitModel.value,
        builder: (unit) => {
            const icon = (unit.isActive)
                ? { name: "colored/green-ticked-circle", alt: t("units.statuses.Active") }
                : { name: "colored/grey-clock", alt: t("units.statuses.Inactive") }
                ;
            return {
                value: unit.id,
                label: unit.name,
                icon: props.showUnitState ? icon : null
            };
        }
    });
});

const waitingForSearch = computed(() => {
    return unitsStore.waitingForSearch(searchQuery.value, fieldIdentifier);
});

const searchUnits = (query: string) => {
    if (query === "") {
        // do not search with empty query, as we never need to show all records
        clearSearchResults();
        return;
    }

    const maxNumberOfUnits = 50;

    unitsStore.performSearch({ query, maxNumberOfUnits, fieldIdentifier });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        // when opening the field, perform search with empty query to show all records (currently disabled)
        searchUnits("");
        return;
    }

    // since the search results are currently stored in a single store,
    // they need to be cleared so that results from search in one field do not show up in another.

    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
};

const handleSearch = (query: string) => {
    searchUnits(query);
};

const clearSearchResults = () => {
    unitsStore.reset();
};

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};

defineExpose({
    focus
});

</script>
<style scoped lang="scss"></style>
