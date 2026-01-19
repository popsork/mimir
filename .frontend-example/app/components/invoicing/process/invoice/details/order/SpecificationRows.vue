<template lang="pug">
GenericTable(v-if="numberOfRows > 0" name="goods-rows" :columns="columns" :number-of-rows="numberOfRows")
    template(v-slot)
        tr(v-for="(specificationRow, index) in specificationRows" :key="index")
            td(data-name="start-date") {{ specificationRow.startDateText }}
            td(data-name="start-point") {{ specificationRow.startPointName }}
            td(data-name="end-date") {{ specificationRow.endDateText }}
            td(data-name="end-point") {{ specificationRow.endPointName }}
            td(data-name="activity") {{ specificationRow.activityName }}
            td(data-name="quantity") {{ localizeNumber(specificationRow.quantity) }}
            td(data-name="unit") {{ specificationRow.unitText }}
            td(data-name="executions") {{ localizeNumber(specificationRow.executions) }}
            td(data-name="hours") {{ localizeNumber(specificationRow.hours) }}
</template>
<script setup lang="ts">
import type { InvoiceSpecificationRow } from "~/models/Invoice";

const props = defineProps<{
    specificationRows: InvoiceSpecificationRow[],
}>();

const numberOfRows = computed(() => props.specificationRows?.length ?? 0);

const columnNames = [
    "start-date", "start-point",
    "end-date", "end-point",
    "activity",
    "quantity", "unit",
    "executions", "hours"
] as const;

const { t } = useI18n();
const columns = computed(() => {
    return columnNames.map((name) => ({
        name: name,
        label: t(`invoicing.process.invoice.fields.specification_rows.${humanize(name)}`),
    }));
});

</script>
<style scoped lang="scss">
table {
    :deep(colgroup) {
        col {
            &[data-name="start-date"],
            &[data-name="end-date"] {
                width: 10%;
            }

            &[data-name="start-point"],
            &[data-name="end-point"] {
                width: 15%;
            }

            &[data-name="activity"] {
                width: 25%;
            }

            &[data-name="quantity"] {
                width: 7%;
            }

            &[data-name="unit"] {
                width: 5%;
            }

            &[data-name="executions"] {
                width: 8%;
            }

            &[data-name="hours"] {
                width: 5%;
            }

        }
    }

    :deep(tr) {
        th,
        td {
            &[data-name="quantity"],
            &[data-name="executions"],
            &[data-name="hours"] {
                text-align: right;
            }
        }
    }

    :deep(tbody) tr td {
        @include small-medium-text;
    }

}
</style>
