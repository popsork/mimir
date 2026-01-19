<template lang="pug">
GenericTable(name="history" :columns="columns" :number-of-rows="auditEntries.length")
    template(v-slot)
        OrderFormHistoryTableRow(
            v-for="auditEntry in auditEntries"
            :key="auditEntry.id"
            :audit-entry="auditEntry"
        )
    template(v-slot:no-entries) {{ $t("history.No entries") }}
</template>
<script setup lang="ts">
const auditEntriesStore = useOrderFormAuditEntriesStore();

const dataColumnNames = ["source", "number-of-changes", "date-and-time", "record-type", "action"] as const;

const extraColumnNames = ["expand"] as const;

const { t } = useI18n();

const dataColumns = computed(() => {
    return dataColumnNames.map((name) => ({
        name: name,
        label: t(`history.fields.${name}`),
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


const { auditEntries } = storeToRefs(auditEntriesStore);

</script>
<style scoped lang="scss">
table {

    :deep(colgroup) {
        $number-of-data-columns: 5;
        $number-of-extra-columns: 1;

        $extra-column-width: steps(6);

        col {
            &:not([data-name="expand"]) {
                width: calc((100% - #{$extra-column-width * $number-of-extra-columns}) / #{$number-of-data-columns});
            }

            &[data-name="expand"] {
                width: $extra-column-width;
            }
        }
    }

    :deep(tbody) tr {

        &.expanded.summary {
            border-bottom: none;
        }

        &.expanded {
            background: $color-background-lightest;
        }

        td {
            vertical-align: middle;

            &[data-name="toggle"] {
                text-align: center;
            }
        }

        &.details {
            td {
                vertical-align: top;
                height: auto;
                padding-bottom: steps(1.5);
            }
        }

    }
}
</style>
