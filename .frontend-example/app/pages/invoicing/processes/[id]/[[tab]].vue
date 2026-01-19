<template lang="pug">
.invoicing-process.page
    WaitingBox(:while="WaitingFor.InvoicingProcessLoading")
        InvoicingProcessHeader
        InvoicingProcessTabSelector
        InvoicingProcessActiveTabContent(v-if="tabName" :tab="tabName")
</template>
<script setup lang="ts">
definePageMeta({
    activeTopLevelRouteName: "invoicing"
});

const route = useRoute();

const defaultTabName = Object.values(InvoicingProcessTabName)[0];

const validTabNames = Object.values(InvoicingProcessTabName);

const tabName = computed(() => {
    if (typeof route.params.tab !== "string" || !validTabNames.includes(route.params.tab as InvoicingProcessTabName)) {
        return null;
    }
    return route.params.tab as InvoicingProcessTabName;
});
const store = useInvoicingProcessStore();

watch(tabName, (tabName) => {
    if (!tabName) {
        store.reset();

        goToRoute({
            name: route.name,
            params: {
                ...route.params,
                tab: defaultTabName,
            }
        }, { replace: true });
    }
}, { immediate: true });

const routeProcessId = computed(() => {
    if (typeof route.params.id !== "string") {
        return null;
    }
    return route.params.id;
});

const { processIsMissing } = storeToRefs(store);

watch(routeProcessId, (orderId) => {
    store.setProcessId(orderId);
});

nextTick().then(() => {
    // instead of using { immediate: true } on the routeProcessId watcher,
    // wait for the next tick before triggering the first setProcessId call.

    // this is a workaround for a problem in the store:
    // if everything happens in the same tick, there is a scenario where the processId watcher in the store
    // does not get triggered if navigating back to the same process.
    // (e.g., opening a process from process list, then going back to process list, and then opening the same process again)
    // waiting for next tick here fixes this issue
    store.setProcessId(routeProcessId.value);
});

watch(processIsMissing, (processIsMissing) => {
    if (processIsMissing) {
        show404();
    }
});


const { t } = useI18n();

const titleParts = computed(() => {
    return t("pages.titles.Invoicing process");
});

usePageTitle({ parts: titleParts });

</script>
<style scoped lang="scss">
.invoicing-process.page {
    display: flex;
    flex-direction: column;

    .header {
        flex: 0 0 auto;
    }

    .tab-selector {
        flex: 0 0 auto;
    }

    .active-tab-content {
        flex: 1 1 auto;
        overflow-y: auto;
        scrollbar-gutter: stable;
    }
}
</style>
