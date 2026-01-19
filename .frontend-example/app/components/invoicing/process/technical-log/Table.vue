<template lang="pug">
GenericTable(name="log" :columns="columns" :number-of-rows="numberOfRows")
    template(v-slot)
        InvoicingProcessTechnicalLogTableRow(v-for="logEntry in logEntries" :key="logEntry.id" :log-entry="logEntry")
    template(v-slot:no-entries) {{ $t("invoicing.process.log.No log entries available") }}
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

const props = defineProps<{
    logEntries: InvoicingProcessLogEntry[],
}>();

const columnNames = ["date", "time", "message", "context"] as const;

const { t } = useI18n();
const columns = computed(() => {
    return columnNames.map((name) => ({
        name: name,
        label: t(`invoicing.process.log.columns.${humanize(name)}`),
    }));
});

const numberOfRows = computed(() => props.logEntries?.length ?? 0);

</script>
<style scoped lang="scss">
table {

    :deep(colgroup) {
        $number-of-narrow-columns: 2;

        $narrow-column-width: steps(20);
        $message-column-width: steps(50);

        $number-of-variable-width-columns: 1;

        col {
            width: calc((100% - #{$narrow-column-width * $number-of-narrow-columns} - $message-column-width) / #{$number-of-variable-width-columns});

            &[data-name="date"],
            &[data-name="time"] {
                width: $narrow-column-width;
            }

            &[data-name="message"] {
                width: $message-column-width;
            }
        }
    }

}
</style>
