<template lang="pug">
.field(
    :data-name="name"
    :data-type="type"
    :data-layout="layout"
    :data-size="size"
    :data-suffix-position="suffixPosition"
    :class="classes"
    :title="title"
)
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    NInputNumber(
        v-if="isNumberField"
        ref="input"
        v-model:value="numberValue"
        v-bind="numberInputComponentProps"
    )
        template(v-slot:suffix)
            WaitingIndicator(v-if="isWaiting")
            slot(v-else name="suffix")
    NInput(
        v-else
        ref="input"
        v-model:value="stringValue"
        v-bind="stringInputComponentProps"
        v-on:change="emit('change')"
    )
        template(v-slot:suffix)
            WaitingIndicator(v-if="isWaiting")
            slot(v-else name="suffix")
    FormErrors(:errors="errors")
</template>
<script setup lang="ts">
import { NInput, NInputNumber } from "naive-ui"; // explicit import needed for typescript during build

// layouts:
// loose - labels above
// compact - labels inside (called "combined" in figma)

// sizes:
// medium - normal box height
// large - larger box height

// combinations:
// loose medium - label above, 10px label text, 12px input text, 24px box height - used in normal forms
// loose large - label above, 12px label text, 12px input text, 36px box height - used in some dialog forms

// compact medium - label inside, 9px label text, 10px input text, 28px box height - used in compact forms
// compact large - label inside, 10px label, 12px input text, 36px box height - not sure if currently used

// custom styles:
// type search - label above (usually not used), 12px text, 32px box height, round corners
// NOTE: search type always overrides layout to loose and size to large

const props = withDefaults(defineProps<{
    name?: string,
    type?: "text" | "email" | "password" | "search" | "textarea" | "integer" | "decimal",
    label?: string,
    labelVisible?: boolean,
    layout?: "loose" | "compact",
    size?: "medium" | "large",
    placeholder?: string,
    maxlength?: number,
    disabled?: boolean,
    readonly?: boolean,
    changed?: boolean,
    clearable?: boolean,
    waitingFor?: WaitingFor, // auto-wait based on a defined waiter in the store
    waiting?: boolean, // or manually accept waiting state for more complex cases,
    resizable?: boolean,
    autosize?: boolean, // for textareas to grow automatically with content
    decimalPlaces?: number,
    errors?: FormFieldError[],
    suffixPosition?: "top" | "bottom", // only for textareas
    min?: number,
    max?: number,
}>(), {
    type: "text",
    labelVisible: true,
    layout: "loose",
    size: "medium",
    placeholder: "",
    disabled: false,
    readonly: false,
    changed: false,
    clearable: false,
    waiting: false,
    resizable: true,
    suffixPosition: "top",
});

const value = defineModel<string | number | null>();

const stringValue = computed({
    get: () => {
        if (typeof value.value === "number") {
            return value.value.toString();
        }
        return value.value;
    },
    set: (newValue: string | null) => {
        value.value = newValue;
    }
});

const numberValue = computed({
    get: () => {
        if (typeof value.value !== "number") {
            return null;
        }
        return value.value;
    },
    set: (newValue: number | null) => {
        value.value = newValue;
        // number input uses lazy updating (only when user leaves the field)
        // so emitting change can be done after value update
        emit("change");
    }
});

const suffixPosition = computed(() => {
    if (!isTextarea.value || !hasSuffix.value) {
        return undefined;
    }
    return props.suffixPosition;
});

const classes = computed(() => {
    const classes: string[] = [];

    if (props.errors && props.errors.length > 0) {
        classes.push("has-error");
    }

    if (props.disabled) {
        classes.push("disabled");
    }

    if (props.changed) {
        classes.push("changed");
    }

    if (isWaiting.value) {
        classes.push("waiting");
    }

    if (isResizable.value) {
        classes.push("resizable");
    }

    if (hasSuffix.value) {
        classes.push("has-suffix");
    }

    return classes;
});

const layout = computed(() => {
    if (props.type === "search") {
        return "loose";
    }
    return props.layout;
});

const size = computed(() => {
    if (props.type === "search") {
        return "large";
    }
    return props.size;
});

const inputSize = computed<"small" | "medium" | "large">(() => {
    // internally, n-input has three sizes: small, medium, large,
    // which are used for 24px, 28px and 36px respectively
    if (size.value === "large") {
        return "large";
    }
    if (layout.value === "compact") {
        return "medium";
    }
    return "small";
});

const inputType = computed<"text" | "textarea">(() => {
    return (props.type === "textarea") ? "textarea" : "text";
});

const isTextarea = computed(() => {
    return inputType.value === "textarea";
});

const isResizable = computed(() => {
    return isTextarea.value && props.resizable;
});

const isIntegerField = computed(() => {
    return props.type === "integer";
});

const isDecimalField = computed(() => {
    return props.type === "decimal";
});

const isNumberField = computed(() => {
    return isIntegerField.value || isDecimalField.value;
});


const isLabelVisible = computed(() => props.labelVisible || props.layout === "compact");

const slots = useSlots();

const hasSuffix = computed(() => {
    return slots.suffix || isWaiting.value;
});

const title = computed(() => {
    return (props.label && !isLabelVisible.value) ? props.label : undefined;
});


const commonInputComponentProps = computed(() => {
    return {
        name: props.name,
        type: inputType.value,
        size: inputSize.value,
        round: props.type === "search",
        placeholder: props.placeholder,
        maxlength: props.maxlength,
        disabled: props.disabled,
        readonly: props.readonly,
        resizable: (isTextarea.value) ? isResizable.value : undefined,
        clearable: props.clearable,
    };
});

const stringInputComponentProps = computed(() => {
    return {
        ...commonInputComponentProps.value,
        autosize: isTextarea.value && props.autosize ? { minRows: 3 } : undefined,
        inputProps: {
            spellcheck: "false" as const,
            autocomplete: "off",
            type: props.type,
        }
    };
});

const decimalPlaces = computed(() => {
    if (isIntegerField.value) {
        return 0;
    }

    if (props.type === "decimal" && typeof props.decimalPlaces !== "number") {
        throw new Error("Decimal input requires explicitly specifying decimalPlaces prop as a number");
    }

    return props.decimalPlaces;
});


const numberInputComponentProps = computed(() => {
    return {
        ...commonInputComponentProps.value,
        min: props.min,
        max: props.max,
        inputProps: {
            autocomplete: "off",
        },
        "show-button": false,
        precision: decimalPlaces.value,

        parse: (input: string) => {
            return parseLocalizedNumber(input);
        },
        format: (value: number | null) => {
            const stringValue = localizeNumber(value, { maximumFractionDigits: decimalPlaces.value });
            if (stringValue === null) {
                return "";
            }
            return stringValue;
        }
    };
});


const waitStore = useWaitStore();
const isWaiting = computed(() => {
    if (props.waiting) {
        return true;
    }

    if (!props.waitingFor) {
        return false;
    }
    return waitStore.is(props.waitingFor);
});


const input = useTemplateRef("input");

const focus = () => {
    if (input.value) {
        input.value.focus();
    }
};

defineExpose({
    focus
});

const emit = defineEmits<{
    (e: "change"): void,
}>();

</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    /* stylelint-disable selector-class-pattern */
    @mixin input-text-elements {
        .n-input__input,
        .n-input__input-el,
        .n-input__placeholder,
        .n-input__textarea,
        .n-input__textarea-el {
            @content;
        }
    }


    &.has-error {
        :deep(.n-input) {
            .n-input__border {
                border-color: $color-border-error;
            }
        }
    }

    &.changed {
        :deep(.n-input) {
            @include input-text-elements {
                color: $color-text-changed;
            }
        }
    }

    &.disabled {
        .label {
            color: $color-text-disabled;
        }

        :deep(.n-input) {
            .n-base-icon {
                color: $color-text-disabled;
            }
        }
    }

    :deep(.n-input) {

        .n-input__input-el,
        .n-input__textarea-el {
            @include no-autofill-background;
        }


        .n-input__suffix {
            button {
                @include clickable-button;
            }

            .svg {
                display: inline-flex;
                align-items: center;
            }

            .waiting-indicator {
                .svg svg {
                    width: steps(2);
                    height: steps(2);
                }
            }
        }
    }

    &[data-type="textarea"] {

        &[data-size][data-layout] {

            :deep(.n-input) {
                // use same radius for all sizes and layouts
                border-radius: $element-border-radius-small;

                // make suffix full field height in textareas
                .n-input__suffix {
                    padding: steps(0.5) 0;

                    &,
                    .svg {
                        height: auto;
                    }
                }
            }

            &[data-suffix-position="top"] {
                :deep(.n-input) .n-input__suffix {
                    align-items: flex-start;
                }
            }

            &[data-suffix-position="bottom"] {
                :deep(.n-input) .n-input__suffix {
                    align-items: flex-end;
                }
            }
        }

        &:not(.resizable) {
            :deep(.n-input) {
                // minimum height settings to make the field fill its container vertically.
                // this does not work with resizable textareas
                // because Naive UI's resizing mechanism does not work correctly with min-heights applied
                &,
                .n-input-wrapper {
                    min-height: 100%;
                }
            }
        }


    }

    &[data-layout="compact"][data-type="textarea"] {
        .label {
            background: $color-background-lightest;
        }

        &.has-suffix {
            .label {
                // when label is inside the field, prevent it overlapping with the suffix
                right: steps(3);
            }
        }

        &.disabled {
            .label {
                background: $color-background-light;
            }
        }
    }

    &[data-layout="loose"][data-size="medium"] {
        .label {
            @include small-text;
        }

        :deep(.n-input) {
            border-radius: $element-border-radius-smallest;

            @include input-text-elements {
                @include normal-text;
            }

            .n-input__suffix {

                &,
                .svg {
                    height: steps(3);
                }
            }
        }
    }

    &[data-layout="loose"][data-size="large"] {
        .label {
            @include normal-text;
        }

        :deep(.n-input) {
            border-radius: $element-border-radius-small;

            @include input-text-elements {
                @include normal-text;
            }

            .n-input__textarea-el,
            .n-input__textarea .n-input__placeholder {
                padding-top: 3px;
            }

            .n-input__suffix {
                &,
                .svg {
                    height: steps(4.5);
                }
            }
        }

        &[data-type="search"] {
            :deep(.n-input) {

                border-radius: steps(4);

                .n-input-wrapper {
                    padding-left: steps(1.5);
                }

                @include input-text-elements {
                    height: steps(4);
                    @include normal-text;
                }

                .n-input__suffix {
                    height: steps(4);
                }

            }
        }
    }

    &[data-layout="compact"][data-size="medium"] {
        .label {
            @include tiny-medium-text;
            position: absolute;
            z-index: 1; // any positive z-index to put it above the input
            top: 1px;
            left: 6px;
            right: 6px;
            width: auto;
            padding: 3px steps(1) steps(0.5) 0;
            pointer-events: none;
        }

        :deep(.n-input) {
            border-radius: $element-border-radius-smaller;

            @include input-text-elements {
                @include small-medium-text;
            }

            .n-input__input-el,
            .n-input__input .n-input__placeholder {
                padding-top: 11px;
            }

            .n-input__textarea-el,
            .n-input__textarea .n-input__placeholder {
                padding-top: 16px;
            }

            .n-input__suffix {
                &,
                .svg {
                    height: steps(3.5);
                }
            }
        }
    }

    &[data-layout="compact"][data-size="large"] {
        .label {
            @include small-text;
            position: absolute;
            z-index: 1; // any positive z-index to put it above the input
            top: 1px;
            left: steps(1);
            right: steps(1);
            width: auto;
            padding: 2px steps(1) steps(0.5) 0;
            pointer-events: none;
        }

        :deep(.n-input) {
            border-radius: $element-border-radius-small;

            @include input-text-elements {
                @include normal-text;
            }

            .n-input__input-el,
            .n-input__input .n-input__placeholder {
                padding-top: 14px;
            }

            .n-input__textarea-el,
            .n-input__textarea .n-input__placeholder {
                padding-top: 20px;
            }

            .n-input__suffix {
                &,
                .svg {
                    height: steps(4.5);
                }
            }

        }
    }

    /* stylelint-enable selector-class-pattern */
}
</style>
