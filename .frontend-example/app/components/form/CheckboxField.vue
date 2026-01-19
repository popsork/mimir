<template lang="pug">
.field(:data-name="name" data-type="checkbox" :data-size="size" :class="classes")
    input(
        :id="inputId"
        ref="input"
        v-model="modelValue"
        :disabled="disabled"
        :value="value"
        type="checkbox"
        :name="name"
        v-on:change="emitChange"
    )
    span.checked-indicator
        SvgImage(v-if="isChecked" name="tick")
    span.label
        label(v-if="label" :for="inputId") {{ label }}
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    name?: string,
    id?: string,
    label?: string,
    size?: "medium" | "small",
    value?: boolean | string,
    disabled?: boolean,
    changed?: boolean,
}>(), {
    size: "medium",
    disabled: false,
    changed: false,
});

const modelValue = defineModel<boolean | string[] | null>();

const inputId = computed(() => props.id ?? generateNewUuid());

const isChecked = computed(() => {
    if (Array.isArray(modelValue.value)) {
        return modelValue.value.includes(props.value as string);
    }
    return !!modelValue.value;
});

const classes = computed(() => {
    const classes: string[] = [];

    if (props.disabled) {
        classes.push("disabled");
    }

    if (props.changed) {
        classes.push("changed");
    }

    return classes;
});

const emit = defineEmits<{
    (e: "change"): void,
}>();

const emitChange = (event: Event) => {
    // this is needed to prevent input's native change event from propagating upwards,
    // as it carries with it the native event object as an argument which some parent components may not expect,
    // so instead emit a clean custom change event with no arguments
    event.stopPropagation();
    emit("change");
};

</script>
<style scoped lang="scss">
.field {
    position: relative;

    display: flex;
    align-items: center;

    input,
    .checked-indicator {
        position: absolute;
        left: 0;
        top: 0;
    }

    input {
        appearance: none;

        &::before {
            content: "";
            display: inline-block;
            position: relative;

            border: 1px solid $color-border-darker;
            overflow: hidden;
            border-radius: $element-border-radius-smallest;
            background: $color-background-lightest;
            cursor: pointer;
        }

        &:checked::before {
            border-width: 0;
            background: $color-background-inverted;
            color: $color-text-inverted;
        }
    }

    .checked-indicator {
        color: $color-text-inverted;
        pointer-events: none;
    }

    .label {
        color: $color-text-normal;
        display: inline-flex;
        align-items: center;
    }


    &.changed {
        input {
            &::before {
                border-color: $color-text-changed;
            }

            &:checked::before {
                border: 1px solid $color-text-changed;
                background: $color-text-changed;
            }
        }
    }

    &.disabled {

        input {
            &::before,
            &:checked::before {
                border: 1px solid $color-border-normal;
                background: $color-background-light;
                cursor: not-allowed;
            }
        }

        .checked-indicator,
        .label {
            color: $color-text-disabled;
        }
    }

    &:not(.changed, .disabled) {
        input {
            &:hover {
                &::before {
                    border-color: $color-border-hover;
                }
            }
        }
    }

    &[data-size="medium"] {
        padding-left: steps(3.5);

        .label {
            @include normal-text;
            min-height: steps(2.5);
        }

        input::before,
        .checked-indicator {
            width: steps(2.5);
            height: steps(2.5);
        }
    }

    &[data-size="small"] {
        padding-left: steps(2.5);

        .label {
            @include small-text;
            min-height: steps(2);
        }

        input::before,
        .checked-indicator {
            width: steps(2);
            height: steps(2);
        }
    }
}
</style>
