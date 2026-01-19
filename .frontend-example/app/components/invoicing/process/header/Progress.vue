<template lang="pug">
InvoicingProcessHeaderSection(:title="$t('invoicing.process.sections.Progress')" name="progress")
    ol.steps(v-if="steps.length > 0")
        InvoicingProcessHeaderProgressStep(v-for="step in steps" :key="step.id" :step="step" :process="process")
    .actions(v-if="shouldShowActions")
        template(v-if="restartingAllowed")
            GenericButton(
                size="medium"
                type="primary"
                v-on:click="showRestartProcessDialog"
            ) {{ $t("invoicing.process.actions.Restart process") }}
            InvoicingProcessRestartDialog
        template(v-if="cancellingAllowed")
            GenericButton(
                size="medium"
                type="dangerous"
                v-on:click="showCancelProcessDialog"
            ) {{ $t("invoicing.process.actions.Cancel process") }}
            InvoicingProcessCancelDialog
        GenericButton(
            v-if="markingExternalProcessingAsDoneAllowed"
            type="secondary"
            size="medium"
            :waiting-for="WaitingFor.InvoicingProcessMarkingExternalProcessingAsDone"
            v-on:click="markExternalProcessingAsDone"
        ) Mark external processing as done (for testing)

</template>
<script setup lang="ts">
import type { InvoicingProcessStep } from "~/models/InvoicingProcessStep";


const processStore = useInvoicingProcessStore();

const { process } = storeToRefs(processStore);

const steps = computed(() => {
    return (process.value.steps ?? []) as InvoicingProcessStep[];
});

const shouldShowActions = computed(() => {
    return restartingAllowed.value || cancellingAllowed.value || markingExternalProcessingAsDoneAllowed.value;
});

const restartingAllowed = computed(() => {
    // restarting is allowed if process is cancellable
    return cancellingAllowed.value;
});

const cancellingAllowed = computed(() => {
    // these statuses should match the cancelable array in app/Domains/Invoicing/Enums/InvoiceProcessStatus.php
    const allowedByStatus = process.value.status && [
        InvoicingProcessStatus.Pending,
        InvoicingProcessStatus.Running,
        InvoicingProcessStatus.Failed,
        InvoicingProcessStatus.Error,
    ].includes(process.value.status);

    if (!allowedByStatus) {
        return false;
    }

    // if status allows cancelling, but the bookkeeping step has completed, then cancelling is not allowed
    const bookkeepingStep = process.value.steps?.find((step) => {
        return step.type === InvoicingProcessStepType.Bookkeeping;
    });

    if (bookkeepingStep?.getStatus() === InvoicingProcessStepStatus.Completed) {
        return false;
    }

    return true;
});

const markingExternalProcessingAsDoneAllowed = computed(() => {
    return process.value.status === InvoicingProcessStatus.ExternalProcessing;
});


const statusChangeStore = useInvoicingProcessStatusChangeStore();

const showRestartProcessDialog = () => {
    statusChangeStore.initializeDialog({
        invoicingProcessId: process.value.id,
        status: InvoicingProcessStatus.Restarting
    });
};

const showCancelProcessDialog = () => {
    statusChangeStore.initializeDialog({
        invoicingProcessId: process.value.id,
        status: InvoicingProcessStatus.Cancelling
    });
};

const { showMessage } = useFloatingMessage();

const { errors: statusChangeErrors } = storeToRefs(statusChangeStore);

const markExternalProcessingAsDone = async () => {
    statusChangeStore.initializeStatusChange({
        invoicingProcessId: process.value.id,
        status: InvoicingProcessStatus.ExternalProcessingDone
    });
    const markingOk = await statusChangeStore.performStatusChange();
    if (markingOk) {
        statusChangeStore.reset();
        showMessage({
            type: FloatingMessageType.Success,
            text: "External processing marked as done"
        });
        processStore.reloadProcess();
        return;
    }

    statusChangeErrors.value.forEach((error) => {
        showMessage({
            type: FloatingMessageType.Error,
            text: error.getMessage()
        });
    });
};

</script>
<style scoped lang="scss">
section {
    display: flex;
    flex-direction: column;

    .steps {
        @include flex-list;

        .step {
            flex: 1;
        }
    }
    .actions {
        margin-top: auto;
        display: flex;
        gap: steps(1);
        padding: steps(0.5) 0;
    }
}
</style>
