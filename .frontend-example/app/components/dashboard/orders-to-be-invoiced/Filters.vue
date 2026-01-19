<template lang="pug">
GenericForm(class="filters" v-on:submit.prevent="saveFilters")
    .header
        GenericButton(
            icon="chevron-right"
            size="small"
            type="alternative-ghost"
            :title="$t('general.Close')"
            v-on:click="closeSidebar"
        )
        h2.title {{ $t('dashboard.orders.Filters') }}
    .filter-groups
        FilterBuilder(v-model="filters" :properties="dashboardFilterableProperties")
    .actions
        FormErrors(:errors="errors")
        GenericButton(type="tertiary" v-on:click="clearAll" ) {{ $t('general.Clear all') }}
        GenericButton(icon="ticked-circle" button-type="submit" :waiting-for="WaitingFor.ViewUpsert") {{ $t('general.Save') }}
</template>
<script setup lang="ts">
const columnsStore = useOrdersListColumnsStore();
const { filterableProperties } = storeToRefs(columnsStore);

const viewsStore = useViewsStore();
const { formErrors } = storeToRefs(viewsStore);

//
// For some reason, this computed is required to allow
// saveErrors to be used as attribute in `FormErrors`.
// If using saveErrors directly a weird typescript typing error
// occurs.
const errors = computed(() => formErrors.value);

const filtersStore = useDashboardInvoiceableOrderFiltersStore();
const { currentEditingFilter, currentEditingChart } = storeToRefs(filtersStore);
const closeSidebar = () => {
    currentEditingChart.value = null;
};

const filters = computed(() => currentEditingFilter.value || undefined);

//
// Here we remove the "release_for_invoicing_at" property from the user defined filters
// as that is used by the dashboard chart to calculate orders to be invoiced and it makes
// no sence to let the user filter on that.
const releaseForInvoicingAtKey: DefinedOrderRowKey = "release_for_invoicing_at";
const dashboardFilterableProperties = computed(() => {
    return filterableProperties.value.filter(property => property.key !== releaseForInvoicingAtKey);
});

const clearAll = () => {
    filtersStore.resetFilters();
};

const saveFilters = () => {
    if (!filters.value) {
        return null;
    }

    filtersStore.saveFilters(filters.value);
};
</script>
<style scoped lang="scss">
.filters {
    @include panel-shadow;
    background-color: $color-background-lighter;
    width: steps(40);
    height: 100%;

    display: flex;
    flex-direction: column;

    .header {
        @include content-padding;
        display: flex;
        padding-top: steps(2);
        padding-bottom: steps(1.5);

        .title {
            @include large-medium-text;
        }
    }

    .filter-groups {
        flex: 1;
        @include content-padding;
        overflow-y: auto;
        padding-bottom: steps(1);
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: steps(2);
        padding: steps(2) $gutter steps(5);
        background-color: $color-background-lighter;

        .button {
            flex: 1;
        }
    }

    .errors {
        flex: 0 0 100%;
    }
}
</style>
