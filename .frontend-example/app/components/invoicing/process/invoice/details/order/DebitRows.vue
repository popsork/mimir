<template lang="pug">
GenericTable(v-if="numberOfRows > 0" name="debit-rows" :columns="columns" :number-of-rows="numberOfRows")
    template(v-slot)
        tr(v-for="(debitRow, index) in debitRows" :key="index")
            td(data-name="specification") {{ debitRow.specification }}
            td(data-name="quantity") {{ debitRow.quantityText }}
            td(data-name="price") {{ localizeCurrencyAmount(debitRow.price, { unlimitedPrecision: true }) }}
            td(data-name="total") {{ localizeCurrencyAmount(debitRow.total, { unlimitedPrecision: true }) }}
</template>
<script setup lang="ts">
import type { InvoiceDebitRow } from "~/models/Invoice";

const props = defineProps<{
    debitRows: InvoiceDebitRow[],
}>();

const numberOfRows = computed(() => props.debitRows?.length ?? 0);

const columnNames = ["specification", "quantity", "price", "total"] as const;

const { t } = useI18n();
const columns = computed(() => {
    return columnNames.map((name) => ({
        name: name,
        label: t(`invoicing.process.invoice.fields.debit_rows.${humanize(name)}`),
    }));
});


</script>
<style scoped lang="scss">
table {
    :deep(colgroup) {
        col {
            width: 20%;

            &[data-name="specification"] {
                width: 40%;
            }
        }
    }

    :deep(tr) {
        th,
        td {
            &[data-name="quantity"],
            &[data-name="price"],
            &[data-name="total"] {
                text-align: right;
            }
        }
    }
}
</style>
