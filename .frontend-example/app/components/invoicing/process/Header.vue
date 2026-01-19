<template lang="pug">
section.header(ref="header")
    .sections
        InvoicingProcessHeaderProcessSummary
        InvoicingProcessHeaderInvoiceSummary
        InvoicingProcessHeaderJournal
        InvoicingProcessHeaderProgress
</template>
<script setup lang="ts">

useElementHeightTracking("invoicingProcessHeader", useTemplateRef("header"));

</script>
<style scoped lang="scss">
.header {
    .sections {
        display: flex;
        gap: steps(2);

        @include content-padding;
        padding-top: steps(2.5);

        section {
            flex: 1 1 auto;
        }

        // the total number of steps for 4 fieldsets should sum to 229 (235 steps total minus 3 gaps of 2 steps)
        section[data-name="process-summary"],
        section[data-name="invoice-summary"],
        section[data-name="journal"] {
            flex-basis: steps(37);
        }

        section[data-name="progress"] {
            flex-basis: steps(118);
        }
    }

}
</style>
