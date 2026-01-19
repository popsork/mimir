<template lang="pug">
OrderFormHistoryTableColumnsChangedValues(name="old-values" :values="values")
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

const values = computed(() => {
    return props.auditEntry.oldValues;
});

</script>
<style scoped lang="scss"></style>
