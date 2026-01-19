<template lang="pug">
.form(v-if="selectedView")
    FormInputField(
        v-model="selectedView.name"
        :label="$t('views.view_settings.fields.Title')"
        :errors="viewNameErrors"
        size="large"
        layout="compact"
    )

    ViewsSettingsFieldsShortcut(v-model="selectedView.shortcut" :disabled="shortcutFieldIsDisabled" :view="selectedView")

    .checkboxes(v-if="currentUserIsAdmin")
        FormCheckboxField(
            v-model="isDefault"
            size="small"
            :label="$t('views.view_settings.fields.Default')"
        )
        FormCheckboxField(
            v-model="selectedView.isSticky"
            size="small"
            :label="$t('views.view_settings.fields.Sticky')"
        )

    //- Team sharing field missing, implemented in TMS-448

    ViewsSettingsFieldsColorPicker(v-model="selectedView.tabBackgroundColor")

    FormErrors(:errors="additionalFormErrors")
</template>
<script setup lang="ts">

import type { View, ViewConfig } from "~/models/View";
import type { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

const selectedView = defineModel<View<ViewConfig> | null>();
const props = defineProps<{
    formErrors: JsonApiErrorCollection,
}>();

const formErrors = computed(() => props.formErrors);
const currentUserPermissions = useCurrentUserPermissionStore();

const viewNameErrors = computed(() => formErrors.value.forField("name"));
const additionalFormErrors = computed(() => {
    return formErrors.value.exceptForFields(["name"]);
});

const currentUserIsAdmin = computed(() => currentUserPermissions.isAdmin());

const isDefault = computed({
    get() {
        if (!selectedView.value) {
            return false;
        }

        return selectedView.value.type === ViewType.Default;
    },

    set(value) {
        if (!selectedView.value) {
            return;
        }

        selectedView.value.type = value ? ViewType.Default : ViewType.Regular;
    }
});

const shortcutFieldIsDisabled = computed(() => isDefault.value || !!selectedView.value?.isSticky);
</script>
<style scoped lang="scss">
.form {
    display: flex;
    flex-direction: column;
    gap: steps(2);
}

.checkboxes {
    display: flex;

    .field {
        flex-basis: 0 0 50%;
        width: 50%;
    }
}

.actions {
    padding-bottom: steps(5);
}
</style>
