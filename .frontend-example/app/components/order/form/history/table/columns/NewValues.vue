<template lang="pug">
OrderFormHistoryTableColumnsChangedValues(name="new-values" :values="values")
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

const values = computed(() => {
    return props.auditEntry.newValues;
});

</script>
<style scoped lang="scss"></style>
