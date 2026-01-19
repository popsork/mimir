<template lang="pug">
ConfirmationDialog(
    v-model:show="shouldShowCancelDialog"
    :title="$t('invoicing.process.actions.Cancel process')"
    :message="$t('invoicing.process.messages.Do you want to cancel this process?')"
    :cancel-button-text="$t('general.Close')"
    :waiting-for="WaitingFor.InvoicingProcessCancelling"
    v-on:confirm="cancelProcess"
)
    template(v-slot:additional-content)
        FormErrors(:errors="errors")
</template>
<script setup lang="ts">
const { t } = useI18n();

const processStore = useInvoicingProcessStore();

const statusChangeStore = useInvoicingProcessStatusChangeStore();
const { shouldShowDialog, targetStatus, errors } = storeToRefs(statusChangeStore);

const shouldShowCancelDialog = computed({
    get: () => shouldShowDialog.value && targetStatus.value === InvoicingProcessStatus.Cancelling,
    set: (val: boolean) => {
        if (!val) {
            statusChangeStore.reset();
        }
    }
});

const { showMessage } = useFloatingMessage();
const cancelProcess = async () => {
    if (!shouldShowCancelDialog.value) {
        // this ensures that the correct target status is set in the store
        return;
    }
    const cancelOk = await statusChangeStore.performStatusChange();
    if (cancelOk) {
        statusChangeStore.reset();
        showMessage({
            type: FloatingMessageType.Success,
            text: t("invoicing.process.messages.Process cancellation started")
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
