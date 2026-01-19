<template lang="pug">
ConfirmationDialog(
    v-model:show="shouldShowRestartDialog"
    :title="$t('invoicing.process.actions.Restart process')"
    :message="$t('invoicing.process.messages.Do you want to restart this process?')"
    :cancel-button-text="$t('general.Close')"
    :waiting-for="WaitingFor.InvoicingProcessRestarting"
    v-on:confirm="restartProcess"
)
    template(v-slot:additional-content)
        FormErrors(:errors="errors")
</template>
<script setup lang="ts">
const { t } = useI18n();

const processStore = useInvoicingProcessStore();

const statusChangeStore = useInvoicingProcessStatusChangeStore();
const { shouldShowDialog, targetStatus, errors } = storeToRefs(statusChangeStore);

const shouldShowRestartDialog = computed({
    get: () => shouldShowDialog.value && targetStatus.value === InvoicingProcessStatus.Restarting,
    set: (val: boolean) => {
        if (!val) {
            statusChangeStore.reset();
        }
    }
});

const { showMessage } = useFloatingMessage();
const restartProcess = async () => {
    if (!shouldShowRestartDialog.value) {
        // this ensures that the correct target status is set in the store
        return;
    }
    const restartOk = await statusChangeStore.performStatusChange();
    if (restartOk) {
        statusChangeStore.reset();
        showMessage({
            type: FloatingMessageType.Success,
            text: t("invoicing.process.messages.Process restarting started")
        });
        processStore.reloadProcess();
    }
};

</script>
<style scoped lang="scss">
.errors {
    margin-top: steps(1);
}
</style>
