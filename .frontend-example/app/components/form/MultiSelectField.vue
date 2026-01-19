<template lang="pug">
.field(:data-name="name" data-type="multi-select" :title="title")
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    NSelect(
        v-model:value="value"
        multiple
        :options="props.options"
        v-bind="multiSelectProps"
        :render-label="renderLabel"
        :render-tag="renderTag"
    )
        template(v-slot:empty)
            span.no-options {{ getBlankValueLabelText() }}
        template(v-if="headerLabel" v-slot:header) {{ headerLabel }}
        template(v-slot:action)
            GenericButton.action(type="ghost" v-on:click="clearAll") {{ $t("general.Clear all") }}
</template>
<script setup lang="ts">
import type {
    SelectRenderLabel,
    SelectRenderTag
} from "naive-ui";
import { GenericTag } from "#components";

type MultiSelectOption = {
    value?: string | number,
    label: string,
    color?: string,
    textColor?: string,
    selectedColor?: string,
    selectedTextColor?: string,
};

export type MultiSelectValue = Array<string | number> | null;

const props = withDefaults(defineProps<{
    options: MultiSelectOption[],
    name?: string,
    label?: string,
    labelVisible?: boolean,
    menuWidth?: "fixed" | "auto",
    headerLabel?: string,
    show?: boolean | undefined,
}>(), {
    labelVisible: true,
    menuWidth: "auto",
    show: undefined
});

const value = defineModel<MultiSelectValue>();

const clearAll = () => {
    value.value = [];
};

const isLabelVisible = computed(() => props.labelVisible);

const title = computed(() => {
    return (props.label && !isLabelVisible.value) ? props.label : undefined;
});


const optionValues = computed(() => props.options.map(option => option.value));

watch(optionValues, (newValues) => {
    const currentValue = value.value;
    if (currentValue === null || currentValue === undefined) {
        return;
    }
    // remove selected values which are not available in the new options
    const validValues = currentValue.filter(v => newValues.includes(v));
    if (validValues.length !== currentValue.length) {
        value.value = validValues;
    }
});

const multiSelectProps = computed(() => {
    return {
        name: props.name,
        placeholder: "",
        "consistent-menu-width": props.menuWidth === "fixed",
        "menu-size": "small" as const,
        "menu-props": {
            class: "form-multi-select-field"
        },
        //  show: dropdownVisible.value
    };
});


const renderLabel: SelectRenderLabel = (option, selected) => {
    // this renders the selectable options in the opened dropdown

    // the "option" argument from naive-ui can contain other types like SelectGroupOption etc,
    // which we do not use, so the type can be forced to our custom MultiSelectOption
    const forcedOption = option as MultiSelectOption;

    const tagProps = {
        text: forcedOption.label,
        size: "large" as const,
        color: getOptionColor(forcedOption, selected),
        textColor: getOptionTextColor(forcedOption, selected)
    };

    return h(GenericTag, tagProps);
};



const renderTag: SelectRenderTag = ({ option, handleClose }) => {
    // this renders the selected values inside the input field

    // the "option" argument from naive-ui can contain other types like SelectGroupOption etc,
    // which we do not use, so the type can be forced to our custom MultiSelectOption
    const forcedOption = option as MultiSelectOption;

    const tagProps = {
        text: forcedOption.label,
        size: "medium" as const,
        removable: true,
        color: getOptionColor(forcedOption, true),
        textColor: getOptionTextColor(forcedOption, true),
        onRemove: () => {
            handleClose();
        }
    };

    return h(GenericTag, tagProps);
};

const getOptionColor = (option: MultiSelectOption, selected: boolean) => {
    if (selected && option.selectedColor) {
        return option.selectedColor;
    }
    return option.color ?? undefined;
};

const getOptionTextColor = (option: MultiSelectOption, selected: boolean) => {
    if (selected && option.selectedTextColor) {
        return option.selectedTextColor;
    }
    return option.textColor ?? undefined;
};

</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    .label {
        @include small-text;
    }

    /* stylelint-disable selector-class-pattern */

    :deep(.n-select) {
        width: 100%;

        .n-base-suffix__arrow {
            --n-arrow-color: #{$color-text-lightest};
            position: relative;
            top: -1px;

            --n-arrow-size: #{steps(2)};
            left: 2px;
        }

        .n-base-selection {
            color: $color-text-normal;

            min-height: steps(2.5);
            @include normal-text;

            .n-base-selection__border,
            .n-base-selection__state-border {
                border-radius: $element-border-radius-smaller;
                border: 1px solid $color-border-darker;
            }

            &.n-base-selection--focus,
            &.n-base-selection--active {

                .n-base-selection__state-border {
                    box-shadow: none;
                    border: none;
                }
            }

            .n-base-selection-tags {
                min-height: steps(3.5);
            }

            .n-base-selection-label {
                height: steps(3);

                .n-base-selection-placeholder {
                    color: $color-text-lightest;
                }

                .n-base-clear {
                    .n-base-clear__clear {
                        .n-base-icon {
                            position: relative;
                            top: -2px;
                        }
                    }
                }
            }
        }

        &:hover {
            .n-base-selection {
                .n-base-selection__border,
                .n-base-selection__state-border {
                    border-color: $color-border-hover;
                }
            }
        }
    }

}
/* stylelint-enable selector-class-pattern */
</style>
<style lang="scss">
.n-select-menu.form-multi-select-field {
    border: 1px solid $color-border-normal;

    /* stylelint-disable selector-class-pattern */
    .n-base-select-menu__empty {
        padding: steps(0.5);
        color: $color-text-lightest;
    }

    .n-base-select-option {
        @include normal-text;
        color: $color-text-normal;

        &.n-base-select-option.n-base-select-option--pending::before {
            background: $color-background-light;
        }
    }

    .n-base-select-menu__header {
        padding-top: 5px;
        padding-bottom: 0;
        @include small-medium-text;
        color: $color-text-lightest;
        border: none;

    }

    .n-base-select-menu__action {
        display: flex;
        justify-content: center;
    }

    /* stylelint-enable selector-class-pattern */
}
</style>
