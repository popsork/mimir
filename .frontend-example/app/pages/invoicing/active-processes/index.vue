<template lang="pug">
InvoicingProcessesPage(:processes="invoicingProcesses" type="active")
</template>
<script setup lang="ts">
definePageMeta({
    activeTopLevelRouteName: "invoicing"
});

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    parts.push(t("pages.titles.Active processes"));

    parts.push(t("pages.titles.Invoicing"));

    return parts;
});

usePageTitle({ parts: titleParts });

const store = useActiveInvoicingProcessesStore();
store.loadInvoicingProcesses();

const { invoicingProcesses } = storeToRefs(store);

</script>
<style scoped lang="scss"></style>
