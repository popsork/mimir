<template lang="pug">
td(data-name="context" :data-expanded="expanded")
    GenericExpansionSwitch(v-model="expanded")
    span.content {{ content }}
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

const props = defineProps<{
    logEntry: InvoicingProcessLogEntry,
}>();

const expanded = ref(false);

const content = computed(() => {
    const context = props.logEntry.context;
    if (context === null) {
        return null;
    }

    return (expanded.value) ? JSON.stringify(context, null, 4) : JSON.stringify(context);
});

</script>
<style scoped lang="scss">
td {
    &[data-expanded="true"] {
        background: $color-background-lightest;

        .content {
            white-space: pre-wrap;
        }
    }
}
</style>
