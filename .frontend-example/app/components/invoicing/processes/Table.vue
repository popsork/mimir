<template lang="pug">
WaitingBox(:while="WaitingFor.InvoicingProcesses")
    table(data-name="invoicing-processes")
        colgroup
            col(v-for="column in columns" :key="column.name" :data-name="column.name")
        thead
            tr
                th(v-for="column in columns" :key="column.name" scope="column" :data-name="column.name") {{ column.label }}
        tbody
            InvoicingProcessesTableRow(v-for="process in processes" :key="process.id" :process="process")
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    processes: InvoicingProcess[],
}>();

const columnNames = ["created-at", "process-status", "number-of-orders", "progress"] as const;

const { t } = useI18n();
const columns = computed(() => {
    return columnNames.map((name) => ({
        name: name,
        label: t(`invoicing.processes.columns.${humanize(name)}`),
    }));
});

</script>
<style scoped lang="scss">
table[data-name="invoicing-processes"] {
    overflow-y: auto;
    table-layout: fixed;
    width: 100%;

    colgroup {

        [data-name="created-at"],
        [data-name="process-status"],
        [data-name="number-of-orders"] {
            width: steps(20);
        }

        [data-name="progress"] {
            width: auto;
        }

    }

    thead {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 100;
        background: $color-background-lightest;

        &::after {
            // border-bottom does not work with sticky thead, so it is applied as a pseudo element
            display: block;
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: $color-border-light;
        }
    }

    thead th,
    tbody:deep(td) {
        text-align: left;
    }

    thead {
        th {
            @include small-strong-text;
            height: steps(3);
            padding: steps(0.5) steps(0.5) 0;
            vertical-align: middle;

            position: sticky;
        }
    }

    tbody {
        tr:nth-child(even) {
            background: $color-background-light;
        }

        &:deep(td) {
            height: steps(7);
            padding: 0;
        }
    }

}
</style>
