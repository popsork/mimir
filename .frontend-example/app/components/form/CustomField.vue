<template lang="pug">
.field(:data-name="name" data-type="custom" :data-size="size" :class="classes" :title="title")
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    .control
        slot
</template>
<script setup lang="ts">

// sizes are used to match the label sizes in other fields

const props = withDefaults(defineProps<{
    name?: string,
    label?: string,
    labelVisible?: boolean,
    size?: "medium" | "large",
    disabled?: boolean,
}>(), {
    labelVisible: true,
    size: "medium",
    disabled: false,
});

const classes = computed(() => {
    const classes: string[] = [];

    if (props.disabled) {
        classes.push("disabled");
    }

    return classes;
});

const size = computed(() => {
    return props.size;
});

const isLabelVisible = computed(() => props.labelVisible);

const title = computed(() => {
    return (props.label && !isLabelVisible.value) ? props.label : undefined;
});

</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    &.disabled {
        .label {
            color: $color-text-disabled;
        }
    }

    &[data-size="medium"] {
        .label {
            @include small-text;
        }
    }

    &[data-size="large"] {
        .label {
            @include normal-text;
            margin-bottom: 2px;
        }
    }
}
</style>
