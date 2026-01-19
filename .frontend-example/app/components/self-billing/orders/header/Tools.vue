<template lang="pug">
ViewsHeaderTools(
    v-model:active-tool="openedSidebar"
    :current-view="view"
    :tools="[ViewTool.ViewSettings, ViewTool.Filters, ViewTool.Columns]"
    v-on:saved="refreshOrRedirect"
    v-on:reverted="refreshOrRedirect"
    v-on:save-failed="openViewSettingsSidebar"
)
</template>
<script setup lang="ts">

import type { View, ViewConfig } from "~/models/View";

const sidebarStore = useSelfBillingSidebarStore();
const { openedSidebar } = storeToRefs(sidebarStore);

const tableViewsStore = useSelfBillingOrdersViewsStore();
const { selectedView } = storeToRefs(tableViewsStore);

//
// Needed here to make typescript understand the types
const view = computed(() => {
    if (!selectedView.value) {
        return null;
    }
    return selectedView.value as TableView;
});

const refreshOrRedirect = (view: View<ViewConfig>, created?: boolean) => {
    if (!created) {
        tableViewsStore.refreshSelectedView();
        return;
    }

    goToRoute({
        name: "self-billing-orders",
        query: {
            view: view.id
        }
    });
};

//
// Because saving of the current view is decoupled from where
// the errors might actually be displayed. If the save view
// returns false then something went wrong, and we open
// the ViewSettings sidebar where the error should be displayed.
const openViewSettingsSidebar = () => {
    sidebarStore.openSidebar(ViewTool.ViewSettings);
};
</script>
<style scoped lang="scss"></style>
