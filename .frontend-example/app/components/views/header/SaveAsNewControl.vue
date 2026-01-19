<template lang="pug">
PopoverDialog(ref="dialog" :title="$t('views.actions.Save as new')" v-on:open="onDialogOpen")
    template(v-slot:trigger)
        GenericButton(
            type="tertiary"
            size="small"
        ) {{ $t("views.actions.Save as new") }}

    GenericForm(id="save-as-new" ref="form" v-on:submit.prevent="saveAsNew")
        FormInputField(
            ref="nameInput"
            v-model="viewName"
            name="name"
            :label="$t('views.save_as_new.View name')"
            :errors="viewNameErrors"
        )
        FormErrors(:errors="additionalFormErrors")
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            size="small"
            v-on:click="closeDialog"
        ) {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            size="small"
            button-type="submit"
            form="save-as-new"
            :waiting-for="WaitingFor.ViewSaveAsNew"
        ) {{ $t("views.save_as_new.Create view") }}
</template>
<script setup lang="ts">
import type { View, ViewConfig } from "~/models/View";

const emit = defineEmits<{
    (e: "saved", view: View<ViewConfig>): void,
}>();

const props = defineProps<{
    view: View<ViewConfig>,
}>();

const viewsStore = useViewsStore();
const { formErrors } = storeToRefs(viewsStore);

const dialog = useTemplateRef("dialog");

const closeDialog = () => {
    if (dialog.value) {
        dialog.value.close();
    }
};

const viewName = ref("");
const viewNameErrors = computed(() => formErrors.value.forField("name"));
const additionalFormErrors = computed(() => {
    return formErrors.value.exceptForFields(["name"]);
});

const nameInput = useTemplateRef("nameInput");

const saveAsNew = async () => {
    const savedView = await viewsStore.saveViewAsNew(props.view, viewName.value);
    if (savedView) {
        emit("saved", savedView);
        closeDialog();
    }
};

const focusInput = () => {
    if (nameInput.value) {
        nameInput.value.focus();
    }
};

const onDialogOpen = () => {
    viewName.value = "";
    viewsStore.clearFormErrors();
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
