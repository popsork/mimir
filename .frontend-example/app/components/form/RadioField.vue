<template lang="pug">
component.field(:is="tag" :data-name="name" data-type="radio" :class="classes")
    input(
        :id="inputId"
        ref="input"
        v-model="modelValue"
        :disabled="disabled"
        :value="value"
        type="radio"
        :name="name"
    )
    span.checked-indicator(v-if="isChecked")
    div.label(v-if="hasSlottedLabel")
        slot
    span.label(v-else)
        label(v-if="label" :for="inputId") {{ label }}
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    name?: string,
    id?: string,
    label?: string,
    value?: string | number,
    disabled?: boolean,
}>(), {
    disabled: false,
});

const slots = useSlots();

const modelValue = defineModel<string | number | null>();

const inputId = computed(() => props.id ?? generateNewUuid());

const isChecked = computed(() => {
    return modelValue.value === props.value;
});

const hasSlottedLabel = computed(() => {
    return !!slots.default;
});

const tag = computed(() => {
    // if the label content is slotted, the entire field becomes a clickable label
    return hasSlottedLabel.value ? "label" : "div";
});

const classes = computed(() => {
    const classes: string[] = [];

    if (isChecked.value) {
        classes.push("checked");
    }

    if (props.disabled) {
        classes.push("disabled");
    }

    if (hasSlottedLabel.value) {
        classes.push("has-slotted-label");
    }

    return classes;
});

</script>
<style scoped lang="scss">
.field {
    display: flex;
    align-items: center;
    position: relative;

    padding-left: steps(3);

    input,
    .checked-indicator {
        position: absolute;
        left: 0;
        top: 2px;
    }

    input {
        appearance: none;

        &::before {
            content: "";
            display: inline-block;
            position: relative;

            border: 1px solid $color-border-darker;
            overflow: hidden;
            border-radius: steps(2);
            background: $color-background-lightest;
            cursor: pointer;
        }
    }

    .checked-indicator {
        color: $color-text-inverted;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &::before {
            content: "";
            display: inline-block;
            height: steps(1);
            width: steps(1);
            border-radius: steps(1);
            background: $color-background-inverted;
        }
    }

    input::before,
    .checked-indicator {
        width: steps(2);
        height: steps(2);
    }


    .label {
        color: $color-text-normal;
    }

    &:not(.has-slotted-label) .label {
        @include normal-text;
        min-height: steps(2.5);
        display: inline-flex;
        align-items: center;
    }

    &.disabled {

        input {
            &::before {
                border: 1px solid $color-border-normal;
                background: $color-background-light;
                cursor: not-allowed;
            }
        }

        .label {
            color: $color-text-disabled;
        }

        .checked-indicator::before {
            // using text color for background because this is not really a background, but more like a bullet point
            background: $color-text-disabled;
        }
    }

    &:not(.disabled) {
        input {
            &:hover {
                &::before {
                    border-color: $color-border-hover;
                }
            }
        }
    }


    &.has-slotted-label {
        padding: steps(1) steps(2) steps(1) steps(4);

        border: 1px solid $color-border-normal;
        border-radius: $element-border-radius;

        cursor: pointer;

        &.checked {
            border-color: $color-border-active;
        }

        input,
        .checked-indicator {
            left: steps(1);
            top: 50%;
            transform: translateY(steps(-1));
        }

        &.disabled {
            background: $color-background-light;
            color: $color-text-disabled;
            border: 1px solid $color-border-normal;
            cursor: not-allowed;
        }
    }


}
</style>
