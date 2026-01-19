<template lang="pug">
FormSelectField(
    :id="id"
    ref="field"
    v-model="destinationId"
    v-model:custom-value="customName"
    :name="name"
    :options="options"
    :layout="layout"
    :size="size"
    :label-visible="labelVisible"
    :label="label"
    :filterable="true"
    :filter="filterFunction"
    :clearable="false"
    :loading="waitingForSearch"
    :errors="errors"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
    v-on:focus="handleFocus"
    v-on:blur="handleBlur"
    v-on:clear="handleClear"
)
    template(v-slot:arrow)
        FormLocationPersistenceIndicator(:persisted="destinationIsPersisted")
        FormLocationAccuracyIndicator(:accuracy="accuracy")
    template(v-slot:action)
        GenericButton(
            type="tertiary"
            size="small"
            v-on:click="handleDialogTriggerClick"
        ) {{ dialogTriggerLabel }}
FormLocationDialog(
    ref="dialog"
    v-model="modelValue"
    :errors="errors"
    :submission-label="dialogSubmissionLabel"
    :require-destination-saving="requirePersistedDestinations"
    v-on:update:model-value="handleDialogUpdate"
)
</template>
<script setup lang="ts">
import { Destination, type DestinationWithLocation } from "~/models/Destination";
import type { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import { Location } from "~/models/Location";

const props = withDefaults(defineProps<{
    id: string, // used to distinguish multiple location fields in the same form when searching
    name?: string,
    label?: string,
    labelVisible?: boolean,
    layout?: "loose" | "compact",
    size?: "medium" | "large",
    dialogSubmissionLabel: string,
    errors?: JsonApiErrorCollection,
    destinationIsPersisted: boolean,

    // when this is true, the add/edit location dialog will not allow confirming a location
    // unless it gets saved as a destination for future use
    requirePersistedDestinations?: boolean,
}>(), {
    labelVisible: true,
    layout: "loose",
    size: "medium",
    requirePersistedDestinations: false,
});

// this field always expects and emits a Destination instance with a Location relationship.
// it is not always a saved destination record, it might be a virtually constructed instance without an ID.
// the same model is also passed into the dialog component and emmitted from there with any changes made in the dialog.
const modelValue = defineModel<DestinationWithLocation>();

// the location field allows three types of input:
// 1) selecting saved destinations from a list by server-side search (copies the values from the destination/location models)
// 2) editing values in a dialog (sets the values directly from the dialog, clearing destinationId unless "save for repeated use" is checked)
// 3) typing a custom value directly into the field (only sets the "name" attribute, clears others and destinationId)

// the values coming from the destination and location models are always stored on the owner record itself,
// not just linked via destinationId,
// so they get emitted as a full Destination instance that can be used to set those values on the owner record.

// if a value is set through the dialog, a simulated "dummy" destination gets built and added to the options list.
// if a custom value is typed directly, the dummy destination is not used,
// as that scenario uses the customValue v-model feature of the select field instead

const destinationsStore = useOrderFormDestinationsStore();

const { destinations, searchQuery } = storeToRefs(destinationsStore);

const DUMMY_DESTINATION_ID = "-1";

const destinationId = computed({
    get: () => {
        // this never actually returns the destination id stored on the record,
        // and instead mostly returns the dummy id, because the selected destination option always represents the record itself,
        // and not the destination from which the values came originally

        if (searchQuery.value.length > 0 && fieldIsFocused.value) {
            // if the user is currently typing something in the search field
            // (while focused in this particular instance of the field, since the searchQuery is shared across all fields),
            // then return the current destination id as null,
            // so that the custom option gets focused in the select field (needed for Enter to work when editing)
            return null;
        }

        const destination = currentDestination.value;
        if (!destination) {
            return null;
        }

        return destination.id;
    },

    set: (id: string) => {
        if (id === DUMMY_DESTINATION_ID) {
            // if the dummy destination gets selected, do nothing because it already has been set
            // and no values should get cleared/changed
            return;
        }

        let destination = (id) ? useRepo(Destination).with("location").find(id) : null;
        if (!destination) {
            destination = new Destination();
            destination.name = customName.value;
        }

        if (!destination.location) {
            destination.location = new Location();
        }

        modelValue.value = destination as DestinationWithLocation;
    }
});


// when the select component emits an update on the custom value v-model,
// it also emits an update on the destinationId v-model immediately after that,
// and the logic for handling the full value update is in the main v-model's setter,
// so the customName v-model can be a simple ref that only preserves the entered value internally and does nothing more.
const customName = ref(null as string | null);

const customNameIsInUse = computed(() => {
    return customName.value !== null;
});


const currentDestination = computed(() => {
    // the currently selected destination is never actually a destination object linked to the record,
    // but a virtual destination object with a label taken from the incoming model value

    if (!modelValue.value) {
        return null;
    }

    if (!modelValue.value.hasAnyLocationValues()) {
        // for blank orders / new records, do not create a dummy destination, because the label will be blank
        return null;
    }

    if (customNameIsInUse.value) {
        // if the custom value is used, then do not create a dummy destination, because it would be confusing,
        // as the custom option will also be shown in the list by Naive UI and should be selected instead
        return null;
    }

    const label = modelValue.value.getLabel();
    // if the options list contain a destination that has the same label as the current value,
    // use that as the current destination to avoid duplicate options
    const existingDestination = findDestinationByLabel(label);
    if (existingDestination) {
        return existingDestination;
    }

    // otherwise build a dummy destination object from the given label just for display purposes
    return buildDummyDestination(label);
});

const findDestinationByLabel = (label: string) => {
    return destinations.value.find(destination => destination.label === label);
};

const buildDummyDestination = (label: string) => {
    const dummyDestination = new Destination();
    dummyDestination.id = DUMMY_DESTINATION_ID;
    dummyDestination.label = label;
    return dummyDestination;
};

const options = computed(() => {
    return buildSelectOptions({
        collection: destinations.value,
        currentObject: currentDestination.value,
        builder: (destination) => {
            return {
                value: destination.id,
                label: destination.label,
            };
        }
    });
});

const isCustomOption = (option: any) => {
    if (!field.value) {
        return false;
    }

    return field.value.isCustomValue(option.value);
};

// this field cannot use :remote="true" because in that case Naive UI no longer supports "tag" (used for entering custom values).
// therefore the "remote" feature is simulated by using a custom filtering function
// which always returns all given options without filtering them on the client side.
// in addition, it also filters out irrelevant custom entries
const filterFunction = (pattern: string, option: any) => {
    if (isCustomOption(option)) {
        // always show the custom entry that exactly matches the typed string
        // and never show any previously entered custom options if they don't exactly match the typed pattern.
        // this unfortunately does not guarantee hiding all old custom values, as Naive UI does not always refilter the options,
        // especially when reopening the option list
        return option.label === pattern;
    }

    // show all other options, as the search is performed on the server side and the list is already filtered
    return true;
};


const handleDialogUpdate = () => {
    // if values get set through the dialog, then the custom name should be cleared,
    // since the value is no longer the result of typing custom text into the field itself.
    // this does not need to retrigger the destinationId setter,
    // as that will already be handled by the dialog emitting the modelValue directly through the v-model binding.

    customName.value = null;
};

const accuracy = computed(() => {
    return modelValue.value?.location?.accuracy || null;
});



const searchDestinations = (query: string) => {
    const fieldIdentifier = props.id;
    const maxNumberOfDestinations = 50;

    destinationsStore.performSearch({
        query,
        maxNumberOfDestinations,
        fieldIdentifier,
    });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        return;
    }

    // since the search results are currently stored in a single store,
    // they need to be cleared so that results from search in one field do not show up in another.
    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
};

const handleSearch = (query: string) => {
    searchQuery.value = query;
    if (query === "") {
        // do not search with empty query, as we never need to show all records
        clearSearchResults();
        return;
    }
    searchDestinations(query);
};

const clearSearchResults = () => {
    destinationsStore.reset();
};

const waitingForSearch = computed(() => {
    return destinationsStore.waitingForSearch(searchQuery.value, props.id);
});

const fieldIsFocused = ref(false);

const handleFocus = () => {
    fieldIsFocused.value = true;
};

const handleBlur = () => {
    fieldIsFocused.value = false;
};

const field = useTemplateRef("field");

const { t } = useI18n();

const dialogTriggerLabel = computed(() => {
    return (destinationId.value || customName.value) ? t("locations.actions.Edit location") : t("locations.actions.Add location");
});

const dialog = useTemplateRef("dialog");

const handleDialogTriggerClick = () => {
    if (field.value) {
        // naive ui doesn't have a "close" method, so we can only use blur() to close the menu,
        // but when clicking the button inside the open menu, the field already counts as blurred,
        // so a workaround is to focus it first and then blur it, which causes the menu to close
        field.value.focus();
        field.value.blur();
    }
    if (dialog.value) {
        dialog.value.open();
    }
};

const emit = defineEmits<{
    (e: "clear"): void,
}>();

const handleClear = () => {
    emit("clear");
};


</script>
<style scoped lang="scss">
.field {

    :deep(.n-select) {
        /* stylelint-disable selector-class-pattern */
        .n-base-selection-label {

            .n-base-suffix__arrow {
                // the location field has two icons in the arrow slot, so the slot styling needs to be customized
                width: steps(4.5);
                height: steps(3);
                position: relative;
                left: steps(-1);
                top: 0;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                background: $color-background-lightest;
            }
        }
        /* stylelint-enable selector-class-pattern */
    }

}
</style>
