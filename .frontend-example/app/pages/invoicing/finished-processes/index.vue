<template lang="pug">
InvoicingProcessesPage(:processes="invoicingProcesses" type="finished")
</template>
<script setup lang="ts">
definePageMeta({
    activeTopLevelRouteName: "invoicing"
});

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    parts.push(t("pages.titles.Finished processes"));

    parts.push(t("pages.titles.Invoicing"));

    return parts;
});

usePageTitle({ parts: titleParts });

const store = useFinishedInvoicingProcessesStore();
store.loadInvoicingProcesses();

const { invoicingProcesses } = storeToRefs(store);

</script>
<style scoped lang="scss"></style>
