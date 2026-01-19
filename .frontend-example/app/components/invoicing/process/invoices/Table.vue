<template lang="pug">
GenericTable(name="invoices" :columns="columns" :number-of-rows="numberOfRows")
    template(v-slot)
        InvoicingProcessInvoicesTableRow(v-for="invoice in invoices" :key="invoice.id" :invoice="invoice")
    template(v-slot:no-entries) {{ $t("invoicing.process.invoices.No invoices available") }}
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoices: Invoice[],
}>();

const dataColumnNames = ["invoice-number", "customer-name", "total-amount"] as const;

const extraColumnNames = ["trigger"] as const;

const { t } = useI18n();

const dataColumns = computed(() => {
    return dataColumnNames.map((name) => ({
        name: name,
        label: t(`invoicing.process.invoices.columns.${humanize(name)}`),
    }));
});

const extraColumns = extraColumnNames.map((name) => ({
    name: name,
    label: null,
}));

const columns = computed(() => [
    ...dataColumns.value,
    ...extraColumns
]);

const numberOfRows = computed(() => props.invoices?.length ?? 0);

</script>
<style scoped lang="scss">
table {

    :deep(colgroup) {
        $number-of-fixed-width-columns: 3;

        $fixed-column-width: steps(37);

        col {
            width: calc((100% - #{$fixed-column-width * $number-of-fixed-width-columns}));

            &[data-name="invoice-number"],
            &[data-name="customer-name"],
            &[data-name="total-amount"] {
                width: $fixed-column-width;
            }

        }
    }

}
</style>
