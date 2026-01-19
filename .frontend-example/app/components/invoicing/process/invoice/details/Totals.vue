<template lang="pug">
.totals
    table(data-name="totals")
        colgroup
            col(data-name="label")
            col(data-name="value")
        tbody
            tr(v-for="(row, index) in rows" :key="index" :data-name="row.name")
                th(data-name="label" scope="row") {{ row.label }}
                td(data-name="value") {{ row.value }}
</template>
<script setup lang="ts">

import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const totals = computed(() => props.invoice.totals);

const rowNames = [
    "net-amount",
    "taxable-amount",
    "vat-amount",
    "total-amount",
    "rounding-amount",
    "final-amount",
] as const;

const { t } = useI18n();

const rowLabels = computed(() => {
    return rowNames.reduce((labels, name) => {
        labels[name] = t(`invoicing.process.invoice.fields.totals.${humanize(name)}`);
        return labels;
    }, {} as Record<typeof rowNames[number], string>);
});

type Row = {
    name: string,
    label: string,
    value: string,
};
const rows = computed(() => {
    if (!totals.value) {
        return [];
    }

    const result: Row[] = [];

    result.push({
        name: "net-amount",
        label: rowLabels.value["net-amount"],
        value: localizeCurrencyAmount(totals.value.netAmount, { unlimitedPrecision: true }),
    });

    result.push({
        name: "taxable-amount",
        label: rowLabels.value["taxable-amount"],
        value: localizeCurrencyAmount(totals.value.taxableAmount, { unlimitedPrecision: true }),
    });

    totals.value.vatAmounts.forEach((vatAmount) => {
        result.push({
            name: `vat-amount`,
            label: `${rowLabels.value["vat-amount"]} ${localizeNumber(vatAmount.vatRate)}%`,
            value: localizeCurrencyAmount(vatAmount.amount, { unlimitedPrecision: true }),
        });
    });

    result.push({
        name: "total-amount",
        label: rowLabels.value["total-amount"],
        value: localizeCurrencyAmount(totals.value.totalAmount, { unlimitedPrecision: true }),
    });

    if (totals.value.roundingAmount !== 0) {
        result.push({
            name: "rounding-amount",
            label: rowLabels.value["rounding-amount"],
            value: localizeCurrencyAmount(totals.value.roundingAmount, { unlimitedPrecision: true }),
        });
    }

    result.push({
        name: "final-amount",
        label: rowLabels.value["final-amount"],
        value: localizeCurrencyAmount(totals.value.finalAmount),
    });

    return result;
});

</script>
<style scoped lang="scss">
.totals {
    display: flex;
    justify-content: flex-end;

    table {
        width: steps(50);
        table-layout: fixed;

        col {
            &[data-name="value"] {
                width: 50%;
            }
        }

        tbody tr {
            border-bottom: 1px solid $color-border-normal;

            th,
            td {
                vertical-align: top;
                @include normal-text;
                padding: steps(0.5) steps(1.5);
            }

            th {
                text-align: left;
            }

            td {
                text-align: right;
            }

            &[data-name="final-amount"] {
                th,
                td {
                    @include normal-heading;
                }
            }
        }
    }

}
</style>
