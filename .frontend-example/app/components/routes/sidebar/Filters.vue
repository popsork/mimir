<template lang="pug">
.sidebar
    RoutesSidebarHeader(:title="$t('routes.list.sidebar.headings.Table filters')")
    .body
        GenericForm(data-name="route-filters" v-on:submit.prevent="applyFilters")
            FormInputField(
                v-model="form.searchQuery"
                :label="$t('routes.list.filters.Search')"
                v-on:change="applyFilters"
            )
            FormSelectField(
                v-model="form.status"
                name="status-filter"
                :label="$t('routes.list.filters.Status')"
                :options="statuses"
                :filterable="true"
                v-on:change="applyFilters"
            )
            fieldset(data-name="start-date")
                FormDateField(
                    v-model="form.startDateFrom"
                    type="date"
                    :label="$t('routes.list.filters.Start date from')"
                    v-on:change="applyFilters"
                )
                FormDateField(
                    v-model="form.startDateTill"
                    type="date"
                    :label="$t('routes.list.filters.Start date till')"
                    v-on:change="applyFilters"
                )
            fieldset(data-name="end-date")
                FormDateField(
                    v-model="form.endDateFrom"
                    type="date"
                    :label="$t('routes.list.filters.End date from')"
                    v-on:change="applyFilters"
                )
                FormDateField(
                    v-model="form.endDateTill"
                    type="date"
                    :label="$t('routes.list.filters.End date till')"
                    v-on:change="applyFilters"
                )
    .footer
        .actions
            GenericButton(
                type="secondary"
                button-type="button"
                icon="reset"
                v-on:click="resetFilters"
            ) {{ $t("routes.list.filters.Reset filters") }}
</template>
<script setup lang="ts">
const { t } = useI18n();
const routeListStore = useRoutesListRoutesStore();

const { form } = storeToRefs(routeListStore);

const statuses = Object.values(TransportOrderStatusName).map(status => ({
    value: status,
    label: t(`transport_orders.statuses.${status}`),
}));

const applyFilters = () => {
    routeListStore.loadRoutes();
};

const resetFilters = () => {
    routeListStore.reset();
    applyFilters();
};

</script>
<style scoped lang="scss">
.sidebar {
    height: 100%;
    background-color: $color-background-lighter;
    display: flex;
    flex-direction: column;

    .body {
        @include content-padding;
        overflow-y: scroll;
        flex: 1 1 auto;

        form {
            display: flex;
            flex-direction: column;
            gap: steps(1);

            fieldset[data-name="start-date"],
            fieldset[data-name="end-date"] {
                display: flex;
                gap: steps(1);
            }
        }
    }

    .footer {
        @include content-padding;
        flex: 0 0 auto;

        padding-top: steps(2);

        .actions {
            display: flex;
            gap: steps(1);
            justify-content: center;
            margin-bottom: steps(3);

            .button {
                flex: 1;
            }
        }
    }
}
</style>
