<template lang="pug">
OrdersSidebar(v-if="view" :title="$t('orders.list.sidebar.headings.View settings')" v-on:close="closeSidebar")
    ViewsSettingsForm(v-model="view" :form-errors="formErrors")
    template(v-slot:footer)
        ViewsSettingsDeleteControl(:view-name="view.name" :disabled="!canDelete" v-on:delete="deleteView")
</template>
<script setup lang="ts">
const listViewsStore = useOrdersListViewsStore();
const viewsStore = useViewsStore();
const { formErrors } = storeToRefs(viewsStore);

const { selectedView } = storeToRefs(listViewsStore);
const sidebarStore = useOrdersListSidebarStore();

//
// this computed field is needed to make the v-model accept the selected
// view for some type reasons.
const view = computed(() => selectedView.value as TableView | null);

const canDelete = computed(() => {
    if (!selectedView.value) {
        return false;
    }

    return !selectedView.value.isReadonly;
});

const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

const deleteView = async () => {
    if (!selectedView.value) {
        return;
    }

    if (await viewsStore.deleteView(selectedView.value.id)) {
        selectedView.value = null;

        //
        // relocate user to order-list root and let
        // order-list "index.vue" component figure
        // out where to send the user next.
        goToRoute({
            name: "orders-list"
        });
    }
};

onUnmounted(() => {
    viewsStore.clearFormErrors();
});
</script>
<style scoped lang="scss"></style>
