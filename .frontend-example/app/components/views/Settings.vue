<template lang="pug">
OrdersSidebar(v-if="view" :title="$t('views.View settings')" v-on:close="closeSidebar")
    ViewsSettingsForm(v-model="view" :form-errors="formErrors")
    template(v-slot:footer)
        ViewsSettingsDeleteControl(:view-name="view.name" :disabled="!canDelete" v-on:delete="deleteView")
</template>
<script setup lang="ts">
import type { TableView } from "~/stores/tables/defineTableViewsStore";

const props = defineProps<{
    context: ViewContext,
}>();

const viewsStore = useViewsStore();
const { formErrors } = useViewsStore();

const contextViewsStore = computed(() => {
    switch (props.context) {
        case ViewContext.OrderList: return useOrdersListViewsStore();
        case ViewContext.InvoiceableOrderList: return useInvoicingOrdersViewsStore();
        case ViewContext.SelfBillableOrderList: return useSelfBillingOrdersViewsStore();
        case ViewContext.OrderTemplates: return useOrderTemplatesViewsStore();
        case ViewContext.OrderMap: return useOrdersMapViewsStore();
        case ViewContext.OrderCalendar: return useOrdersCalendarViewsStore();
    }

    return null;
});

const sidebarStore = computed(() => {
    switch (props.context) {
        case ViewContext.OrderList: return useOrdersListSidebarStore();
        case ViewContext.InvoiceableOrderList: return useInvoicingOrdersSidebarStore();
        case ViewContext.SelfBillableOrderList: return useSelfBillingSidebarStore();
        case ViewContext.OrderTemplates: return useOrderTemplatesSidebarStore();
        case ViewContext.OrderMap: return useOrdersMapSidebarStore();
        case ViewContext.OrderCalendar: return useOrdersCalendarSidebarStore();
        case ViewContext.RouteList: return useRoutesListSidebarStore();
    }

    return null;
});

const getReturnRouteName = () => {
    switch (props.context) {
        case ViewContext.OrderList: return "orders-list";
        case ViewContext.InvoiceableOrderList: return "invoicing-orders";
        case ViewContext.SelfBillableOrderList: return "self-billing-orders";
        case ViewContext.OrderTemplates: return "order-templates-list";
        case ViewContext.OrderMap: return "orders-map";
        case ViewContext.RouteList: return "routes-list";
    }

    return "dashboard";
};

const view = computed(() => {
    if (!contextViewsStore.value || !contextViewsStore.value.selectedView) {
        return null;
    }

    return contextViewsStore.value.selectedView as OrderMapView | TableView;
});

const canDelete = computed(() => {
    if (!view.value) {
        return false;
    }

    return !view.value.isReadonly;
});

const closeSidebar = () => {
    if (!sidebarStore.value) {
        return;
    }

    sidebarStore.value.closeSidebar();
};

const deleteView = async () => {
    if (!view.value || !contextViewsStore.value) {
        return;
    }

    if (await viewsStore.deleteView(view.value.id)) {
        contextViewsStore.value.selectedView = null;

        //
        // relocate user back to root route (depending on context)
        goToRoute({
            name: getReturnRouteName(),
        });
    }
};

</script>
<style scoped lang="scss"></style>
