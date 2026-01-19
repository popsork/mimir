<template lang="pug">
.field(:data-name="name" data-type="readonly" :data-layout="layout" :data-size="size" :class="{ multiline: multiline }")
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    span.value(:title="title") {{ displayableValue }}
    FormErrors(:errors="errors")
</template>
<script setup lang="ts">
// size and layout logic matches match the sizes of FormInputField

const props = withDefaults(defineProps<{
    name?: string,
    label?: string,
    labelVisible?: boolean,
    blankValueVisible?: boolean,
    layout?: "loose" | "compact",
    size?: "medium" | "large",
    value: string | null | undefined,
    title?: string,
    multiline?: boolean,
    errors?: FormFieldError[],
}>(), {
    labelVisible: true,
    blankValueVisible: true,
    multiline: false,
    layout: "loose",
    size: "medium",
});

const displayableValue = computed(() => {
    const actualValue = props.value;
    if (actualValue === null || actualValue === undefined || actualValue === "") {
        return (props.blankValueVisible) ? getBlankValueLabelText() : "";
    }
    return props.value;
});

const isLabelVisible = computed(() => props.labelVisible || props.layout === "compact");

const title = computed(() => {
    const forcedTitle = props.title;
    if (forcedTitle !== undefined) {
        return forcedTitle;
    }

    if (props.multiline) {
        return; // do not duplicate value in title for multiline fields, as it will always be fully shown
    }

    const valueTitle = props.value || undefined;

    const labelTitle = props.label && !isLabelVisible.value ? props.label : undefined;

    if (valueTitle !== undefined && labelTitle !== undefined) {
        return `${labelTitle}: ${valueTitle}`;
    }

    if (valueTitle !== undefined) {
        return valueTitle;
    }

    return labelTitle;
});


</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    &:not(.multiline) {
        overflow: hidden; // this is important to prevent the field from growing with longer values
    }

    .value {
        display: block;
        width: 100%;

        @include normal-medium-text;
        color: $color-text-lighter;
    }

    &.multiline .value {
        white-space: pre-line;
        @include word-break;
    }

    &:not(.multiline) .value {
        @include word-clip;
    }

    &[data-layout="loose"][data-size="medium"] {
        .label {
            @include small-text;
        }

        .value {

            padding-top: 4px; // cannot use align-items: center because of word-clip, so vertical offset is done manually
            padding-left: 6px;
        }

        &:not(.multiline) .value {
            height: steps(3);
        }
    }

    &[data-layout="loose"][data-size="large"] {
        .label {
            @include normal-text;
        }

        .value {

            padding-top: 10px; // cannot use align-items: center because of word-clip, so vertical offset is done manually
        }

        &:not(.multiline) .value {
            height: steps(4.5);
        }
    }

    &[data-layout="compact"][data-size="medium"] {
        .label {
            @include tiny-medium-text;
            position: absolute;
            top: 1px;
        }

        .value {
            padding-top: 12px; // cannot use align-items: center because of word-clip, so vertical offset is done manually
        }
        &:not(.multiline) .value {
            height: steps(3.5);
        }
    }

    &[data-layout="compact"][data-size="large"] {
        .label {
            @include small-text;
            position: absolute;
            top: steps(0.5) - 1px;
        }

        // note that compact+large read-only fields currently do not align with normal fields if used together in a form.
        // if that becomes needed, then maybe a new layout or size should be introduced for read-only fields
        // with the current compact+large styles which are used outside of forms
        .value {
            padding-top: steps(3) - 1px; // cannot use align-items: center because of word-clip, so vertical offset is done manually
        }

        &:not(.multiline) .value {
            height: steps(5.5);
        }
    }
}
</style>
