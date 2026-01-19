<template lang="pug">
InvoicingProcessHeaderSection(:title="$t('invoicing.process.sections.Process summary')" name="process-summary")
    InvoicingProcessStatusBadge(:status="process.status" size="large")
    InvoicingProcessHeaderFieldGroup(name="times")
        FormReadOnlyField(
            :value="formatSystemTimeZoneTime(process.startedAt)"
            name="started-at"
            :label="$t('invoicing.process.fields.Started at')"
            size="large"
            layout="compact"
        )
        template(v-if="shouldShowCancelledAt")
            FormReadOnlyField(
                :value="formatSystemTimeZoneTime(process.cancelledAt)"
                name="cancelled-at"
                :label="$t('invoicing.process.fields.Cancelled at')"
                size="large"
                layout="compact"
            )
        template(v-else)
            FormReadOnlyField(
                :value="formatSystemTimeZoneTime(process.completedAt)"
                name="completed-at"
                :label="$t('invoicing.process.fields.Completed at')"
                size="large"
                layout="compact"
            )
    InvoicingProcessHeaderFieldGroup(name="triggered-by")
        FormReadOnlyField(
            :value="triggeredByText"
            name="triggered-by"
            :label="$t('invoicing.process.fields.Triggered by')"
            size="large"
            layout="compact"
        )
</template>
<script setup lang="ts">

const store = useInvoicingProcessStore();

const { process } = storeToRefs(store);

const shouldShowCancelledAt = computed(() => {
    return process.value.status === InvoicingProcessStatus.Cancelled;
});

const { t } = useI18n();

const triggeredByText = computed(() => process.value.userName ?? t("invoicing.process.System"));


</script>
<style scoped lang="scss">
section {
    position: relative;

    .badge {
        position: absolute;
        right: steps(1.5);
        top: steps(1.5);
    }

    .field-group[data-name="times"] {
        margin-top: steps(2);
    }
}
</style>
