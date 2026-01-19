<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="$t('route.actions.Add stop')" v-on:cancel="close")
    GenericForm(id="add-route-stop" v-on:submit.prevent="addStop")
        FormLocationField(
            id="manual-stop-destination"
            v-model="destination"
            name="destination"
            size="large"
            :destination-is-persisted="destination.isPersisted"
            :require-persisted-destinations="true"
            :label="$t('stops.fields.Location')"
            :dialog-submission-label="$t('general.Save')"
        )
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="add-route-stop"
            :disabled="!isAddingAllowed"
        ) {{ $t("general.Confirm") }}
</template>
<script setup lang="ts">
import type { DestinationWithLocation } from "~/models/Destination";

const addStopStore = useRouteAddStopStore();
const { shouldShowDialog, form } = storeToRefs(addStopStore);

const close = () => {
    addStopStore.reset();
};

const destination = computed({
    // this computed is needed only to re-assert the correct type, as pinia-orm models sometimes lose the type information
    get: () => form.value.destination as DestinationWithLocation,
    set: (value: DestinationWithLocation) => {
        form.value.destination = value;
    },
});

const isAddingAllowed = computed(() => {
    return destination.value.isPersisted;
});

const addStop = () => {
    if (!isAddingAllowed.value) {
        return;
    }
    addStopStore.addManualStop();
    close();
};

</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;
}
</style>
