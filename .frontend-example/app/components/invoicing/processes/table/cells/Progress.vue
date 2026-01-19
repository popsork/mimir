<template lang="pug">
td(data-name="progress")
    InvoicingProcessesTableProcessLink(:process="process")
        ol.steps(v-if="steps.length > 0")
            InvoicingProcessStepIndicator(
                v-for="step in steps"
                :key="step.id"
                :step="step"
                :process="process"
                :show-label="shouldShowLabel(step)"
                tag="li"
            )
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";
import type { InvoicingProcessStep } from "~/models/InvoicingProcessStep";

const props = defineProps<{
    process: InvoicingProcess,
}>();

const steps = computed(() => {
    return props.process.steps ?? [];
});

const shouldShowLabel = (step: InvoicingProcessStep) => {
    return [
        InvoicingProcessStepStatus.Started,
        InvoicingProcessStepStatus.Stopped,
    ].includes(step.getStatus());
};

</script>
<style scoped lang="scss">
.steps {
    @include flex-list;
    gap: steps(1);
}
</style>
