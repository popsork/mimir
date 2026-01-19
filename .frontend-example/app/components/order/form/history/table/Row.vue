<template lang="pug">
tr.summary(:class="{ expanded: expanded }" v-on:click="toggle")
    OrderFormHistoryTableColumnsSource(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsNumberOfChanges(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsDateAndTime(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsRecordType(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsAction(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsToggle(v-model:expanded="expanded")
tr.details(v-if="expanded" :class="{ expanded: expanded }")
    OrderFormHistoryTableColumnsOldValues(:audit-entry="auditEntry")
    OrderFormHistoryTableColumnsNewValues(:audit-entry="auditEntry")
    td(colspan="4")
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

defineProps<{
    auditEntry: AuditEntry,
}>();

const expanded = ref(false);
const toggle = () => {
    expanded.value = !expanded.value;
};

</script>
<style scoped lang="scss">
tr {
    &.summary {
        cursor: pointer;
    }
}
</style>
