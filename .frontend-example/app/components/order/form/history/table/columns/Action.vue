<template lang="pug">
td(data-name="action")
    GenericBadge(:text="label" size="small" :color="color" :text-color="textColor")
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

const { t } = useI18n();

const label = computed(() => {
    return t(`history.events.${props.auditEntry.event}`);
});
const color = computed(() => {
    switch (props.auditEntry.event) {
        case AuditEvent.Created:
            return "#F8EF87"; // $color-audit-event-created
        case AuditEvent.Updated:
        case AuditEvent.PivotAttached:
        case AuditEvent.PivotDetached:
            return "#93B7F1"; // $color-audit-event-updated
        case AuditEvent.Deleted:
            return "#F0B2B2"; // $color-audit-event-deleted
        default:
            return undefined;
    }
});

const textColor = computed(() => {
    return "#373B43"; // $color-text-lighter
});


</script>
<style scoped lang="scss"></style>
