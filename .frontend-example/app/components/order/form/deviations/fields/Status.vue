<template lang="pug">
FormSelectField(
    v-model="value"
    name="status"
    :label="$t('deviation_rows.fields.Status')"
    :label-visible="deviationRowIndex === 0"
    :options="options"
    :errors="errors"
    v-on:change="recalculateOrder"
)
    template(v-slot:input)
        button.trigger(
            ref="trigger"
            type="button"
            :data-value="value"
        )
            .content
                span.text {{ valueText }}
                SvgImage(class="icon" name="chevron-right")
</template>
<script setup lang="ts">

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const { value } = useTextFieldValue({
    recordAccessor: getDeviationRow,
    valueAttribute: "status",
});

const { t } = useI18n();

const valueText = computed(() => {
    if (!value.value) {
        return null;
    }
    return t(`deviation_rows.statuses.${value.value}`);
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDeviationRow,
    field: "status",
});

const options = computed(() => {
    return Object.values(DeviationRowStatus).map((status) => {
        return {
            value: status,
            label: t(`deviation_rows.statuses.${status}`)
        };
    });
});

const trigger = useTemplateRef("trigger");

const focus = () => {
    if (trigger.value) {
        trigger.value.focus();
    }
};
defineExpose({
    focus
});


</script>
<style scoped lang="scss">
.field {
    .trigger {
        @include button-shape;

        width: 100%;
        height: steps(3);
        padding: 0 steps(1);

        @include normal-medium-text;

        .content {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: steps(0.5);

            :deep(.icon) {
                margin-left: auto;

                &,
                > svg {
                    flex-shrink: 0;
                    width: steps(2);
                    height: steps(2);
                }
            }
        }

        &,
        &:focus {
            border: 1px solid $color-border-normal;
        }

        &[data-value="new"] {
            &,
            &:focus {
                background: $color-deviation-status-new;
                border-color: $color-deviation-status-new;
            }
        }

        &[data-value="open"] {
            &,
            &:focus {
                background: $color-deviation-status-open;
                border-color: $color-deviation-status-open;
            }
        }

        // &[data-value="closed"] looks like default and has nothing to override
    }

    .trigger[data-value]:hover,
    .trigger[data-value]:active,
    &.open .trigger[data-value] {
        background: $color-background-darker;
        border-color: $color-background-darker;
    }

}
</style>
