<template lang="pug">
.field(:data-name="name" data-type="switch" :data-layout="layout" :data-label-position="calculatedLabelPosition" :class="classes")
    input(
        :id="inputId"
        ref="input"
        v-model="modelValue"
        :disabled="disabled"
        :value="value"
        type="checkbox"
        :name="name"
    )
    span.label
        label(v-if="label" :for="inputId") {{ label }}
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    name?: string,
    id?: string,
    label?: string,
    layout?: "aligned" | "inline",
    labelPosition?: "before" | "after", // this currently only affects the inline layout
    value?: boolean | string,
    disabled?: boolean,
}>(), {
    layout: "aligned",
    disabled: false,
    labelPosition: "after"
});

const modelValue = defineModel<boolean | string[] | null>();

const inputId = computed(() => props.id ?? generateNewUuid());

const calculatedLabelPosition = computed(() => {
    if (props.layout === "aligned") {
        return null;
    }
    return props.labelPosition;
});

const classes = computed(() => {
    const classes: string[] = [];

    if (props.disabled) {
        classes.push("disabled");
    }

    return classes;
});

</script>
<style scoped lang="scss">
.field {
    position: relative;

    display: flex;
    align-items: center;

    $color-switch-border: $color-border-darker;
    $color-switch-background-on: $color-background-inverted;
    $color-switch-background-off: $color-background-lightest;

    $switch-horizontal-padding: 2px;
    $switch-vertical-padding: 2px;

    $switch-base-width: steps(4.5);
    $switch-base-height: steps(2.5);
    $switch-handle-size: steps(2);
    $switch-border-width: 1px;

    min-height: $switch-base-height;

    input {
        appearance: none;
        position: absolute;

        // switch base
        &::before {
            content: "";
            position: absolute;
            display: inline-block;
            top: 0;
            left: 0;
            width: $switch-base-width;
            height: $switch-base-height;
            background: $color-switch-background-off;

            border: $switch-border-width solid $color-switch-border;
            border-radius: $switch-base-height;

            @include clickable-button;
            @include transition("transform, background", $transition-duration, linear);
        }

        // switch handle
        &::after {
            content: "";
            position: absolute;
            display: inline-block;
            top: $switch-vertical-padding;
            left: $switch-horizontal-padding;
            width: $switch-handle-size;
            height: $switch-handle-size;

            background: $color-switch-background-on;
            border-radius: 50%;

            @include clickable-button;
            @include transition("transform, background", $transition-duration, linear);
        }

        &:checked {
            &::before {
                background: $color-switch-background-on;
            }

            &::after {
                background: $color-switch-background-off;
                transform: translateX($switch-base-width - $switch-handle-size - ($switch-horizontal-padding * 2));
            }
        }

    }

    &.disabled {
        input {
            &::before {
                border-color: $color-border-normal;
                background: $color-background-light;
            }

            &::after {
                background: $color-text-disabled;
            }
        }
        .label {
            color: $color-text-disabled;
        }
    }


    &[data-layout="inline"] {
        display: inline-flex;

        input {
            top: 0;
            width: $switch-base-width;
        }

        &[data-label-position="before"] {
            padding-right: $switch-base-width + steps(1);

            input {
                right: 0;
            }
        }

        &[data-label-position="after"] {
            padding-left: $switch-base-width + steps(1);

            input {
                left: 0;
            }
        }

    }

    &[data-layout="aligned"] {
        display: flex;

        padding-right: $switch-base-width + steps(1);

        input {
            right: $switch-base-width;
            top: 0;
        }
    }


}
</style>
