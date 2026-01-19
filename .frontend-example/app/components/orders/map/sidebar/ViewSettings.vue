<template lang="pug">
OrdersSidebar(v-if="view" :title="$t('orders.list.sidebar.headings.View settings')" v-on:close="closeSidebar")
    ViewsSettingsForm(v-model="view" :form-errors="formErrors")
    template(v-slot:footer)
        ViewsSettingsDeleteControl(:view-name="view.name" :disabled="!canDelete" v-on:delete="deleteView")
</template>
<script setup lang="ts">

const sidebarStore = useOrdersMapSidebarStore();
const viewsStore = useViewsStore();
const { formErrors } = useViewsStore();

const mapViews = useOrdersMapViewsStore();
const { selectedView } = storeToRefs(mapViews);

//
// this computed field is needed to make the v-model accept the selected
// view for some type reasons.
const view = computed(() => selectedView.value as OrderMapView | null);

const canDelete = computed(() => {
    if (!selectedView.value) {
        return false;
    }

    return !selectedView.value.isReadonly;
});

onUnmounted(() => {
    viewsStore.clearFormErrors();
});

const deleteView = async () => {
    if (!selectedView.value) {
        return;
    }

    if (await viewsStore.deleteView(selectedView.value.id)) {
        selectedView.value = null;

        //
        // relocate user to order-map root and let
        // order-map "index.vue" component figure
        // out where to send the user next.
        goToRoute({
            name: "orders-map"
        });
    }
};

const closeSidebar = () => {
    sidebarStore.closeSidebar(ViewTool.ViewSettings);
};
</script>
<style scoped lang="scss"></style>
