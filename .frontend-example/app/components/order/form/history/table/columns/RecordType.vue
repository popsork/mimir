<template lang="pug">
td(data-name="record-type") {{ props.auditEntry.auditableType }}
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

</script>
<style scoped lang="scss"></style>
