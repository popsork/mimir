<template lang="pug">
td(data-name="number-of-changes") {{ props.auditEntry.numberOfChanges }}
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

</script>
<style scoped lang="scss"></style>
