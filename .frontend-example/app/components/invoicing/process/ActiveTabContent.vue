<template lang="pug">
.active-tab-content(:style="{ height: `${availableHeight}px` }" :data-name="activeTabName")
    component(:is="activeTabContentComponent" v-if="activeTabContentComponent")
</template>
<script setup lang="ts">
import {
    InvoicingProcessInvoiceSummary,
    InvoicingProcessJournal,
    InvoicingProcessInvoices,
    InvoicingProcessTechnicalLog,
} from "#components";

const props = defineProps<{
    tab: InvoicingProcessTabName,
}>();

const activeTabName = computed(() => {
    return props.tab;
});

const activeTabContentComponent = computed(() => {
    switch (activeTabName.value) {
        case InvoicingProcessTabName.InvoiceSummary: return InvoicingProcessInvoiceSummary;
        case InvoicingProcessTabName.Journal: return InvoicingProcessJournal;
        case InvoicingProcessTabName.Invoices: return InvoicingProcessInvoices;
        case InvoicingProcessTabName.TechnicalLog: return InvoicingProcessTechnicalLog;
    }

    return null;
});

const { heights } = storeToRefs(useDimensionsStore());

const reservedHeight = computed(() => {
    return heights.value.pageHeader +
        heights.value.invoicingProcessHeader +
        heights.value.invoicingProcessTabSelector;
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const availableHeight = computed(() => windowHeight.value - reservedHeight.value);

</script>
<style scoped lang="scss">
.active-tab-content {
    display: flex;
    flex-direction: column;
    gap: steps(2);

    @include content-padding;
    padding-top: steps(1.5);
    padding-bottom: steps(2);

}
</style>
