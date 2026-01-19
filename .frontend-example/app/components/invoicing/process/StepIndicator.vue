<template lang="pug">
component(:is="tagName" class="step-indicator" :title="titleText" :data-status="status" :data-process-status="processStatus")
    SvgImage(class="icon" :name="iconName")
    span.label(v-if="showLabel") {{ labelText }}
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";
import type { InvoicingProcessStep } from "~/models/InvoicingProcessStep";

const props = withDefaults(defineProps<{
    step: InvoicingProcessStep,
    process: InvoicingProcess,
    tag?: string,
    showLabel?: boolean,
}>(), {
    showLabel: true
});

const tagName = computed(() => {
    return props.tag ?? "li";
});

const { t } = useI18n();

const typeText = computed(() => {
    return t(`invoicing.process.steps.types.${props.step.type}`);
});

const status = computed(() => {
    return props.step.getStatus();
});

const statusText = computed(() => {
    if (status.value === InvoicingProcessStepStatus.Pending) {
        return t(`invoicing.process.steps.statuses.${status.value}`);
    }

    return [
        t(`invoicing.process.steps.times.${capitalizeFirstLetter(status.value)} at`),
        formatSystemTimeZoneTime(props.step.getCurrentStatusSetAt())
    ].join(" ");

});

const labelText = computed(() => {
    return typeText.value;
});

const titleText = computed(() => {
    return `${typeText.value}: ${statusText.value}`;
});

const processStatus = computed(() => {
    return props.process.status;
});

const iconName = computed(() => {
    switch (status.value) {
        case InvoicingProcessStepStatus.Completed:
            return "filled-circled-tick";
        case InvoicingProcessStepStatus.Started:
            return "filled-circled-clock";
        case InvoicingProcessStepStatus.Stopped:
            return "filled-circled-stop-sign";
        case InvoicingProcessStepStatus.Pending:
        default:
            return "filled-circled-dots";
    }
});

</script>
<style scoped lang="scss">
.step-indicator {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: steps(0.5);

    :deep(.icon) {
        &,
        .svg {
            width: steps(2);
            height: steps(2);
        }
    }

    .label {
        @include normal-medium-text;
        margin-right: steps(1);
        color: $color-text-normal;
    }

    &[data-status="pending"] {
        :deep(.icon) {
            color: $color-invoicing-process-step-status-pending;
        }
    }

    &[data-status="started"] {
        :deep(.icon) {
            color: $color-invoicing-process-step-status-started;
        }
    }

    &[data-status="stopped"] {
        :deep(.icon) {
            color: $color-invoicing-process-step-status-stopped;
        }
        .label {
            color: $color-danger;
        }
    }

    &[data-status="completed"] {
        :deep(.icon) {
            color: $color-invoicing-process-step-status-completed;
        }
    }

    &[data-process-status="cancelled"][data-status] {
        // for cancelled processes, all icons and texts are grey
        :deep(.icon) {
            color: $color-invoicing-process-step-status-pending;
        }
        .label {
            color: $color-text-lightest;
        }
    }


}
</style>
