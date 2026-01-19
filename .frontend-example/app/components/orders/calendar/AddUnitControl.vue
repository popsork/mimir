<template lang="pug">
.add-unit
    PopoverDialog(ref="dialog" :title="t('orders.calendar.actions.Add unit')" v-on:open="onDialogOpen")
        template(v-slot:trigger)
            GenericButton(
                type="primary"
                size="small"
                name="add-unit"
                icon="plus-circled"
                icon-placement="before"
            ) {{ t("orders.calendar.actions.Add unit") }}
        GenericForm(id="add-unit" ref="form" v-on:submit.prevent="addUnit")
            FormSelectField(
                ref="unitInput"
                v-model="newUnitId"
                name="unit"
                :filterable="true"
                :remote="true"
                :label="$t('orders.calendar.unit.Find a car')"
                :placeholder="t('orders.calendar.unit.Unit number or name')"
                :options="unitOptions"
                :loading="waitingForSearch"
                v-on:search="handleSearch"
                v-on:update:show="handleUpdateShow"
            )
        template(v-slot:actions)
            GenericButton(
                type="ghost"
                size="small"
                v-on:click="closeDialog"
            ) {{ t("general.Cancel") }}
            GenericButton(
                type="primary"
                size="small"
                button-type="submit"
                form="add-unit"
            ) {{ t("orders.calendar.actions.Add") }}
</template>
<script setup lang="ts">
const unitsStore = useUnitsStore();

const { units, searchQuery } = storeToRefs(unitsStore);

const calendarUnitsStore = useOrdersCalendarUnitsStore();

const { t } = useI18n();

const dialog = useTemplateRef("dialog");

const closeDialog = () => {
    if (dialog.value) {
        dialog.value.close();
    }
};

const fieldIdentifier = "calendar-add-unit";

const waitingForSearch = computed(() => {
    return unitsStore.waitingForSearch(searchQuery.value, fieldIdentifier);
});

const unitOptions = computed(() => {
    return units.value.map((unit) => {
        return { value: unit.id, label: unit.name };
    });
});


const searchUnits = (query: string) => {
    if (query === "") {
        // do not search with empty query, as we never need to show all records
        // but clear any previous search results if they are left over
        clearSearchResults();
        return;
    }

    const maxNumberOfUnits = 50;

    unitsStore.performSearch({ query, maxNumberOfUnits, fieldIdentifier });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        // when opening the field, clear any previous search results
        clearSearchResults();
        return;
    }

    // since the search results are currently stored in a single store,
    // they need to be cleared so that results from this field do not show up in other fields

    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
};

const handleSearch = (query: string) => {
    searchUnits(query);
};

const clearSearchResults = () => {
    unitsStore.reset();
};

const newUnitId = ref(null as string | null);

const form = useTemplateRef("form");

watch(newUnitId, (newValue) => {
    if (!newValue || !form.value) {
        return;
    }
    // since the field is a custom dropdown instead of a text input,
    // to trigger the form submission when the user presses enter in the field after choosing an option,
    // we need to submit the form via script immediately when the value changes (meaning the field gets closed).

    // since we cannot distinguish whether the user chose the value by hitting enter
    // or by clicking on an option with a mouse, the submission also gets triggered when using the mouse.
    // this essentially means that the user never has to click the "Add" button himself.
    form.value.submit();
});

const newUnitHandler = inject("newUnitHandler") as ((unitId: string) => void);

const addUnit = () => {
    if (newUnitId.value === null || newUnitId.value === "") {
        focusInput();
        return;
    }

    const unit = units.value.find(unit => unit.id === newUnitId.value);

    if (!unit) {
        // this should not happen, because the available options for the select are all taken from the store,
        // so the record should be there
        return;
    }

    calendarUnitsStore.addUnit(unit.id);

    closeDialog();
    if (newUnitHandler) {
        newUnitHandler(unit.id);
    }
};

const unitInput = useTemplateRef("unitInput");

const focusInput = () => {
    if (unitInput.value) {
        unitInput.value.focus();
    }
};

const onDialogOpen = () => {
    newUnitId.value = null;
    focusInput();
};

</script>
<style scoped lang="scss">
form {
    .field + .error {
        @include normal-text;
        color: $color-text-error;
    }
}
</style>
