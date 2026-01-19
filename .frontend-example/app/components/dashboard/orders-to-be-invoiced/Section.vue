<template lang="pug">
.title {{ title }}
DashboardOrdersToBeInvoicedChart(
    v-model:date-period="datePeriod"
    :title="$t('dashboard.orders.Orders to be invoiced')"
    :dates="dates"
    :orders-by-date="ordersByDate"
    :type="type"
)
</template>
<script setup lang="ts">
const dashboardInvoiceableOrdersStore = useDashboardInvoiceableOrdersStore();
const {
    personalDatePeriod,
    teamDatePeriod,
    datesToBeInvoiced,
    teamDatesToBeInvoiced,
    invoiceableOrdersByDate,
    teamInvoiceableOrdersByDate
} = storeToRefs(dashboardInvoiceableOrdersStore);

const props = defineProps<{
    type: InvoiceableOrdersChart,
}>();

const { t } = useI18n();

const title = computed(() => {
    return t(`dashboard.chart_types.${props.type}`);
});

const datePeriod = computed({
    get() {
        if (props.type === InvoiceableOrdersChart.Personal) {
            return personalDatePeriod.value;
        }
        return teamDatePeriod.value;
    },
    set(value) {
        if (props.type === InvoiceableOrdersChart.Personal) {
            personalDatePeriod.value = value;
            return;
        }
        teamDatePeriod.value = value;
    },
});

const dates = computed(() => {
    switch (props.type) {
        case InvoiceableOrdersChart.Personal:
            return datesToBeInvoiced.value;
        case InvoiceableOrdersChart.Team:
            return teamDatesToBeInvoiced.value;
        default:
            return [];
    }
});

const ordersByDate = computed(() => {
    switch (props.type) {
        case InvoiceableOrdersChart.Personal:
            return invoiceableOrdersByDate.value;
        case InvoiceableOrdersChart.Team:
            return teamInvoiceableOrdersByDate.value;
        default:
            return [];
    }
});


</script>
<style scoped lang="scss">
.title {
    @include normal-medium-text;
    color: $color-text-normal;
    padding: steps(2) 0;
}
</style>
