<template lang="pug">
GenericBadge(:text="text" :color="color" :border-color="borderColor" :size="size")
</template>
<script setup lang="ts">

const props = defineProps<{
    status: InvoicingProcessStatus | null,
    size: "large" | "medium" | "small",
}>();

const { t } = useI18n();

const text = computed(() => {
    if (!props.status) {
        return "";
    }
    return t(`invoicing.processes.statuses.${props.status}`);
});

const color = computed(() => {
    switch (props.status) {
        case InvoicingProcessStatus.Creating:
        case InvoicingProcessStatus.Pending:
        case InvoicingProcessStatus.Restarting:
            return "#FDD8A0"; // $color-invoicing-process-status-pending
        case InvoicingProcessStatus.Running:
        case InvoicingProcessStatus.ExternalProcessing:
        case InvoicingProcessStatus.ExternalProcessingDone:
            return "#94E1A4"; // $color-invoicing-process-status-running
        case InvoicingProcessStatus.Completed:
            return "#C1C3CD"; // $color-invoicing-process-status-completed
        case InvoicingProcessStatus.Failed:
        case InvoicingProcessStatus.Error:
            return "#F0B2B2"; // $color-invoicing-process-status-failed
        case InvoicingProcessStatus.Cancelling:
        case InvoicingProcessStatus.Cancelled:
            return "transparent";
        default:
            return undefined;
    }
});



const borderColor = computed(() => {
    if (props.status === InvoicingProcessStatus.Cancelling || props.status === InvoicingProcessStatus.Cancelled) {
        return "#DADCE1"; // $color-invoicing-process-status-cancelled
    }
    return undefined;
});


</script>
<style scoped lang="scss"></style>
