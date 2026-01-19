<template lang="pug">
td(data-name="date-and-time") {{ value }}
</template>
<script setup lang="ts">
import { format } from "date-fns";
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

const value = computed(() => {
    const date = getSystemTimeZoneDate(props.auditEntry.createdAt);
    if (!date) {
        return null;
    }
    return format(date, "yyyy-MM-dd HH:mm");
});

</script>
<style scoped lang="scss"></style>
