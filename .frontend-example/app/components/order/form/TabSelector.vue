<template lang="pug">
.tab-selector(ref="selector")
    OrderFormTab(v-for="tab in tabs" :key="tab.name" :name="tab.name")
        template(v-slot:title) {{ tab.title }}
        template(v-if="tab.summary" v-slot:summary) {{ tab.summary }}
    //- show a spinner for dry-runs so that it is visible somewhere that a recalculation is in progress
    WaitingIndicator(v-if="recalculatingOrder")
</template>
<script setup lang="ts">
import type { GoodsRow } from "~/models/GoodsRow";


useElementHeightTracking("orderFormTabSelector", useTemplateRef("selector"));

const { t } = useI18n();

const { order } = storeToRefs(useOrderFormStore());

const availableTabNames = computed(() => {
    const tabNames = Object.values(OrderFormTabName);

    if (!order.value.canHaveScheduleEntries()) {
        tabNames.splice(tabNames.indexOf(OrderFormTabName.Schedule), 1);
    }

    return tabNames;
});

const tabs = computed(() => {
    return availableTabNames.value.map((tabName) => {
        const humanReadableName = capitalizeFirstLetter(humanize(tabName));

        return {
            name: tabName,
            title: t(`order.fieldsets.${humanReadableName}`),
            summary: getTabSummaryText(tabName) ?? undefined
        };
    });
});

const getTabSummaryText = (tabName: OrderFormTabName) => {
    switch (tabName) {
        case OrderFormTabName.Transport:
            return transportSummaryText.value;
        case OrderFormTabName.Specification:
            return specificationSummaryText.value;
        case OrderFormTabName.DebitRows:
            return debitRowsSummaryText.value;
        case OrderFormTabName.Goods:
            return goodsSummaryText.value;
        case OrderFormTabName.Documents:
            return documentsSummaryText.value;
        case OrderFormTabName.Deviations:
            return deviationsSummaryText.value;
        case OrderFormTabName.History:
            return null;
        case OrderFormTabName.Schedule:
            return scheduleSummaryText.value;

    }
};

const transportSummaryText = computed(() => {
    const transportOrders = order.value.transportOrders || [];

    const legsLabel = t("transport_orders.tab_summary.Legs");
    const legsValueText = String(transportOrders.length);

    const distanceLabel = t("transport_orders.tab_summary.Total distance");
    const distances = transportOrders.map(transportOrder => transportOrder.drivingDistanceInKilometres).filter(distance => distance !== null);
    const totalDistanceInKm = (distances.length > 0) ? distances.reduce((total, distance) => total + distance, 0) : null;
    const distanceValueText = totalDistanceInKm === null ? getBlankValueLabelText() : localizeDistance(totalDistanceInKm);

    const parts = [
        `${legsLabel}: ${legsValueText}`,
        `${distanceLabel}: ${distanceValueText}`,
    ];

    return parts.join("; ");
});

const specificationSummaryText = computed(() => {
    if (!order.value.specificationRows || order.value.specificationRows.length < 1) {
        return getBlankValueLabelText();
    }
    const rowsLabel = t("specification_rows.tab_summary.Rows");
    const rowsValueText = String(order.value.specificationRows.length);
    return `${rowsLabel}: ${rowsValueText}`;
});

const debitRowsSummaryText = computed(() => {
    const summary = order.value.debitRowSummary;
    if (!summary) {
        return getBlankValueLabelText();
    }

    const revenueLabel = t("debit_rows.tab_summary.In");
    const expensesLabel = t("debit_rows.tab_summary.Out");
    const revenueValueText = summary.revenueWithoutTax ? localizeCurrencyAmount(summary.revenueWithoutTax) : getBlankValueLabelText();
    const expensesValueText = summary.expensesWithoutTax ? localizeCurrencyAmount(summary.expensesWithoutTax) : getBlankValueLabelText();

    const parts = [
        `${revenueLabel}: ${revenueValueText}`,
        `${expensesLabel}: ${expensesValueText}`,
    ];

    return parts.join("; ");
});

const goodsSummaryText = computed(() => {
    // combine the values into a single summary string in the following format:
    // 26kolli; 412,5kg; 1kbm; 0,4flm; 1ppl

    // all values should be caluclated by summing the corresponding values from all rows.
    // this summary should not use GoodsRowSummary / GoodsTotalOverride from the footer.

    const items = [] as Array<{
        amount: number,
        label: string,
    }>;

    items.push({
        amount: getGoodsSummaryAmount({ amountAttribute: "quantity", precisionAttribute: "quantityPrecision" }),
        label: goodsSummaryQuantityLabel.value
    });

    items.push({
        amount: getGoodsSummaryAmount({ amountAttribute: "weight", precisionAttribute: "weightPrecision" }),
        label: t("general.units.kg")
    });

    items.push({
        amount: getGoodsSummaryAmount({ amountAttribute: "volume", precisionAttribute: "volumePrecision" }),
        label: t("general.units.m3")
    });

    items.push({
        amount: getGoodsSummaryAmount({ amountAttribute: "loadingMetres", precisionAttribute: "loadingMetresPrecision" }),
        label: t("general.units.ldm")
    });

    items.push({
        amount: getGoodsSummaryAmount({ amountAttribute: "palletPlaces", precisionAttribute: "palletPlacesPrecision" }),
        label: t("general.units.ppl")
    });

    // values with 0 amount should be omitted
    const displayableItems = items.filter(item => item.amount > 0);
    if (displayableItems.length === 0) {
        return getBlankValueLabelText();
    }

    const parts = displayableItems.map(item => {
        const amountText = localizeNumber(item.amount, { maximumFractionDigits: 3 });
        return `${amountText}${item.label}`;
    });

    return parts.join("; ");
});

const getGoodsSummaryAmount = (
    { amountAttribute, precisionAttribute }: { amountAttribute: keyof GoodsRow, precisionAttribute: keyof GoodsRow }
): number => {
    const rows = order.value.goodsRows || [];

    let totalAmount = 0;
    rows.forEach(row => {
        const amount = row[amountAttribute] as number | null;
        const precision = row[precisionAttribute] as number | null;
        totalAmount += getRealAmount({ amount, precision }) ?? 0;
    });

    return totalAmount;
};

const goodsSummaryQuantityLabel = computed((): string => {
    // quantity label should use quantity type from the rows.
    // if there are multiple different quantity types, or some types are blank,
    // use "pieces" / "kolli" translation as the quantity type.

    const rows = order.value.goodsRows || [];

    const usedQuantityTypeNames = [] as string[];

    rows.forEach(row => {
        if (!row.quantity) {
            // ignore rows with missing or 0 quantity
            return;
        }
        if (row.quantityType && !usedQuantityTypeNames.includes(row.quantityType.name)) {
            usedQuantityTypeNames.push(row.quantityType.name);
        }
    });

    // if there is exactly one used quantity type name, use it
    if (usedQuantityTypeNames.length === 1) {
        return usedQuantityTypeNames[0]!;
    }

    return t("general.units.pieces");
});

const documentsSummaryText = computed(() => {
    if (!order.value.documents || order.value.documents.length < 1) {
        return getBlankValueLabelText();
    }
    const label = t("documents.tab_summary.Rows");
    const valueText = String(order.value.documents.length);
    return `${label}: ${valueText}`;
});

const deviationsSummaryText = computed(() => {
    const deviationRows = order.value.deviationRows || [];

    const numberOfRowsByStatus = Object.values(DeviationRowStatus).reduce((result, status) => {
        result[status] = 0;
        return result;
    }, {} as Record<DeviationRowStatus, number>);

    deviationRows.forEach(row => {
        if (!(row.status in numberOfRowsByStatus)) {
            return;
        }

        numberOfRowsByStatus[row.status]++;
    });

    const parts = Object.entries(numberOfRowsByStatus).map(([status, numberOfRows]) => {
        const statusLabel = t(`deviation_rows.statuses.${status}`);
        return `${statusLabel}: ${numberOfRows}`;
    });

    return parts.join("; ");
});


const scheduleSummaryText = computed(() => {
    const numberOfEntries = order.value.scheduleEntries?.length || 0;
    if (numberOfEntries > 0) {
        return t("schedule_entries.tab_summary.N entries", { number: numberOfEntries });
    } else {
        return t("schedule_entries.tab_summary.Not defined");
    }
});

const waitStore = useWaitStore();

const recalculatingOrder = computed(() => waitStore.isWaitingFor(WaitingFor.OrderFormOrderRecalculation));

</script>
<style scoped lang="scss">
.tab-selector {
    position: relative;
    display: flex;
    gap: steps(0.5);

    margin: 0 $gutter;
    padding-top: steps(2);

    border-bottom: 2px solid $color-border-light;

    .tab {
        margin-bottom: -2px; // make the tabs overlap the bottom border line
        flex: 0 0 steps(25);

        white-space: nowrap;
    }

    .waiting-indicator {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: steps(2);
        height: steps(2);
        // the spinner should be unobtrusive and not attract attention unless the user is looking for it,
        // so use a very light background color.
        // this is technically not a background, but in this case it's not worth introducing a new color variable.
        color: $color-background-darker;
    }
}
</style>
