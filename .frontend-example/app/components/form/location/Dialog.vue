<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="title" v-on:cancel="close")
    GenericForm(id="location-dialog-form" v-on:submit.prevent="save")
        fieldset(data-name="map")
            FormLocationDialogFieldsMap
        fieldset
            FormLocationDialogFieldsName(ref="firstField")
        fieldset
            FormLocationDialogFieldsStreetName
            FormLocationDialogFieldsStreetNumber
            FormLocationDialogFieldsPostalCode
            FormLocationDialogFieldsCity
            FormLocationDialogFieldsCountry
        fieldset(data-name="address-actions")
            FormLocationDialogLookupButton
            FormLocationDialogClearButton
        fieldset(data-name="coordinates")
            FormLocationDialogFieldsCoordinates
            FormLocationDialogFieldsAccuracy
        fieldset(v-if="shouldSaveDestination")
            FormLocationDialogFieldsContactName
            FormLocationDialogFieldsPhone
            FormLocationDialogFieldsEmail
            FormLocationDialogFieldsNotes
    template(v-slot:actions)
        slot(name="actions")
            FormCheckboxField(
                v-model="shouldSaveDestination"
                :label="destinationSavingLabel"
                name="should-save-destination"
                :disabled="requireDestinationSaving"
            )
            GenericButton(
                type="ghost"
                v-on:click="close"
            ) {{ $t("general.Cancel") }}
            GenericButton(
                type="primary"
                button-type="submit"
                icon="ticked-circle"
                form="location-dialog-form"
                :waiting-for="WaitingFor.OrderFormDestinationSaving"
            ) {{ submissionLabel }}
</template>
<script setup lang="ts">
import type { DestinationWithLocation } from "~/models/Destination";
import type { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

const props = defineProps<{
    submissionLabel: string,
    errors?: JsonApiErrorCollection,
    requireDestinationSaving: boolean,
}>();

const destination = defineModel<DestinationWithLocation>();

const { t } = useI18n();
const title = computed(() => {
    return t("locations.dialog.Location");
});

const shouldShowDialog = ref(false);

const open = () => {
    shouldShowDialog.value = true;
};

const close = () => {
    shouldShowDialog.value = false;
};

defineExpose({
    open,
    close,
});


const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const loadForm = () => {
    if (!destination.value) {
        return;
    }

    store.loadForm(destination.value);
    setOwnerErrorsInStore();
    shouldSaveDestination.value = props.requireDestinationSaving;

};

const ownerErrors = computed(() => {
    return props.errors;
});

const setOwnerErrorsInStore = () => {
    store.setOwnerErrors(ownerErrors.value ?? null);
};

watch(ownerErrors, () => {
    setOwnerErrorsInStore();
}, { deep: true });



watch(shouldShowDialog, async (newValue) => {
    if (!newValue) {
        store.reset();
        return;
    }

    loadForm();
    await nextTick();
    focusFirstField();
}, { immediate: true });

const firstField = useTemplateRef("firstField");

const focusFirstField = () => {
    firstField.value?.focus();
};

const isPersistedDestination = computed(() => {
    return !!form.value.destination.isPersisted;
});

const destinationSavingLabel = computed(() => {
    if (isPersistedDestination.value) {
        return t("locations.actions.Update stored destination for repeated use");
    }
    return t("locations.actions.Save as new destination for repeated use");
});

const save = async () => {
    if (shouldSaveDestination.value) {
        const savingResult = await store.saveDestination({
            destinationId: form.value.destination.id,
            locationId: form.value.destination.location.id,
        });
        if (!savingResult) {
            return;
        }
        form.value.destination.isPersisted = true;
    } else {
        // always mark the destination as not persisted when only updating the row without saving the destination.
        // this does nothing for specification rows, but clears the destination id for stops.
        form.value.destination.isPersisted = false;
    }

    destination.value = form.value.destination as DestinationWithLocation;
    close();
};

const shouldSaveDestination = ref(false);

</script>
<style scoped lang="scss">
form {
    width: steps(73);

    fieldset:not([data-name="map"], [data-name="address-actions"]) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: steps(2);
        margin-bottom: steps(2);
    }

    fieldset[data-name="map"],
    fieldset[data-name="address-actions"] {
        margin-bottom: steps(2);
    }

    fieldset[data-name="address-actions"] {
        display: flex;
        gap: steps(2);
    }

    fieldset[data-name="coordinates"] {
        border-top: 1px solid $color-border-light;
        padding-top: steps(2);
    }

}

.actions {
    .field[data-name="should-save-destination"] {
        margin-right: auto;
        align-self: center;
    }
}
</style>
