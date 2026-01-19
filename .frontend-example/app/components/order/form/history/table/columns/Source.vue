<template lang="pug">
td(data-name="source") {{ value }}
</template>
<script setup lang="ts">
import type { AuditEntry } from "~/models/AuditEntry";

const props = defineProps<{
    auditEntry: AuditEntry,
}>();

const { t } = useI18n();
const value = computed(() => {
    return props.auditEntry.userName ?? t("history.System");
});

</script>
<style scoped lang="scss"></style>
