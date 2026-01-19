<template lang="pug">
li.step(:data-status="status" :data-process-status="processStatus")
    .indicator-box
        InvoicingProcessStepIndicator(:step="step" :process="process")
    ul.times(v-if="step.startedAt")
        //- only show any times if the step has at least started, so that the first line is always "Started at"
        li(data-name="started-at" :title="startedAtTitle") {{ formatSystemTimeZoneTime(step.startedAt) }}
        template(v-if="shouldShowStoppedAt")
            li(data-name="stopped-at" :title="stoppedAtTitle") {{ formatSystemTimeZoneTime(step.stoppedAt) }}
        template(v-else-if="shouldShowCompletedAt")
            li(data-name="completed-at" :title="completedAtTitle") {{ formatSystemTimeZoneTime(step.completedAt) }}
    FormError(v-if="step.errorMessage" size="small" :message="step.errorMessage")
    .actions(v-if="shouldShowRetryButton")
        GenericButton(
            size="small"
            type="primary"
            v-on:click="retryStep"
        ) {{ $t("invoicing.process.steps.actions.Retry") }}
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";
import type { InvoicingProcessStep } from "~/models/InvoicingProcessStep";

const props = defineProps<{
    step: InvoicingProcessStep,
    process: InvoicingProcess,
}>();

const { t } = useI18n();

const startedAtTitle = computed(() => {
    return buildTitle(t("invoicing.process.steps.times.Started at"), props.step.startedAt);
});

const stoppedAtTitle = computed(() => {
    return buildTitle(t("invoicing.process.steps.times.Stopped at"), props.step.stoppedAt);
});

const completedAtTitle = computed(() => {
    return buildTitle(t("invoicing.process.steps.times.Completed at"), props.step.completedAt);
});

const buildTitle = (labelText: string, utcDatetimeString: string | null) => {
    return [
        labelText,
        formatSystemTimeZoneTime(utcDatetimeString)
    ].join(" ");
};

const status = computed(() => {
    return props.step.getStatus();
});

const processStatus = computed(() => {
    return props.process.status;
});

const shouldShowStoppedAt = computed(() => {
    return status.value === InvoicingProcessStepStatus.Stopped;
});

const shouldShowCompletedAt = computed(() => {
    return status.value === InvoicingProcessStepStatus.Completed;
});

const stepIsRetryable = computed(() => {
    return props.step.type && [
        InvoicingProcessStepType.ExportInvoices
    ].includes(props.step.type);
});

const shouldShowRetryButton = computed(() => {
    return status.value === InvoicingProcessStepStatus.Stopped && stepIsRetryable.value;
});

const retryStep = () => {
    alert("Not implemented yet");
};

</script>
<style scoped lang="scss">
.step {
    display: flex;
    flex-direction: column;

    .indicator-box {
        padding: steps(1.5) 0 steps(1);
        border-bottom: 1px solid $color-border-normal;
        margin-bottom: steps(0.5);
    }

    &[data-status="pending"] {
        .indicator-box {
            border-bottom-color: $color-invoicing-process-step-status-pending;
        }
    }

    &[data-status="started"] {
        .indicator-box {
            border-bottom-color: $color-invoicing-process-step-status-started;
        }
    }

    &[data-status="stopped"] {
        .indicator-box {
            border-bottom-color: $color-invoicing-process-step-status-stopped;
        }
    }

    &[data-status="completed"] {
        .indicator-box {
            border-bottom-color: $color-invoicing-process-step-status-completed;
        }
    }

    &[data-process-status="cancelled"][data-status] {
        .indicator-box {
            border-bottom-color: $color-invoicing-process-step-status-pending;
        }
    }

    .times {
        @include block-list;
        color: $color-text-lightest;

        li {
            @include small-text;
        }
    }

    &[data-status="stopped"] {
        .times {
            color: $color-text-error;
        }
    }

    .actions {
        margin-top: steps(1);
    }

}
</style>
