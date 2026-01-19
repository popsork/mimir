<template lang="pug">
ViewsHeaderTools(
    v-model:active-tool="openedSidebar"
    :current-view="view"
    :tools="[ViewTool.ViewSettings, ViewTool.Details]"
    v-on:saved="refreshOrRedirect"
    v-on:reverted="refreshOrRedirect"
    v-on:save-failed="openViewSettingsSidebar"
)
</template>
<script setup lang="ts">

import type { View, ViewConfig } from "~/models/View";

const sidebarStore = useOrdersCalendarSidebarStore();
const { openedSidebar } = storeToRefs(sidebarStore);

const calendarViewsStore = useOrdersCalendarViewsStore();
const { selectedView } = storeToRefs(calendarViewsStore);

//
// Needed here to make typescript understand the types
const view = computed(() => {
    if (!selectedView.value) {
        return null;
    }
    return selectedView.value as CalendarView;
});
const refreshOrRedirect = (view: View<ViewConfig>, created?: boolean) => {
    if (!created) {
        calendarViewsStore.refreshSelectedView();
        return;
    }

    goToRoute({
        name: "orders-calendar",
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
