<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="$t('order.actions.Save as template')" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="save-as-template" v-on:submit.prevent="saveAsTemplate")
        FormInputField(
            ref="firstField"
            v-model="form.templateName"
            size="large"
            name="template-name"
            :label="$t('order.fields.Template name')"
        )
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="save-as-template"
            icon="ticked-circle"
            :disabled="!isSavingAllowed"
            :waiting-for="WaitingFor.OrderFormOrderSaving"
        ) {{ $t("general.Save") }}
</template>
<script setup lang="ts">
const { t } = useI18n();

const formStore = useOrderFormStore();
const { order, orderIsNew } = storeToRefs(formStore);

const firstField = useTemplateRef("firstField");

const focusFirstField = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};

const isSavingAllowed = computed(() => {
    // since all validation errors will only be shown on the main form itself,
    // where the template name field may not be available yet,
    // simply prevent saving if it is empty to avoid validation errors on it
    return !!form.value.templateName && form.value.templateName.trim().length > 0;
});

const saveAsTemplateStore = useOrderFormSaveAsTemplateStore();

const { shouldShowDialog, form } = storeToRefs(saveAsTemplateStore);

const route = useRoute();

const defaultTabName = Object.values(OrderFormTabName)[0];

const validTabNames = Object.values(OrderFormTabName);

const tabName = computed(() => {
    if (typeof route.params.tab !== "string" || !validTabNames.includes(route.params.tab as OrderFormTabName)) {
        return null;
    }
    return route.params.tab as OrderFormTabName;
});

const { showMessage } = useFloatingMessage();

const saveAsTemplate = async () => {
    const shouldRedirectAfterSave = orderIsNew.value;

    const savingOk = await saveAsTemplateStore.performSavingAsTemplate();

    if (savingOk) {
        showMessage({
            type: FloatingMessageType.Success,
            text: t("order.messages.Template saved")
        });
    } else {
        showMessage({
            type: FloatingMessageType.Error,
            text: t("order.messages.Template saving failed due to validation errors")
        });
    }

    close();

    if (!savingOk || !shouldRedirectAfterSave) {
        return;
    }

    goToOrderRoute({ id: order.value.id, tab: tabName.value || defaultTabName }, { replace: true });
};

const close = () => {
    saveAsTemplateStore.reset();
};


</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;

    .field {
        margin-bottom: steps(2);
    }
}
</style>
