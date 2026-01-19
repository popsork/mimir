<template lang="pug">
.tag(:data-size="size" v-bind="tagProps")
    span.text {{ text }}
    button(v-if="removable" :title="$t('general.Remove')" v-on:click="handleRemove")
        SvgImage(class="icon" name="cross")
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
    size?: "small" | "medium" | "large",
    text: string,
    removable?: boolean,
    color?: string | undefined,
    textColor?: string | undefined,
}>(), {
    size: "medium",
    removable: false,
    color: "#EEEEF0", // $color-background-light
    textColor: "#373B43", // $color-text-lighter
});

const tagProps = computed(() => {
    const styleParts = [] as string[];

    if (props.color) {
        styleParts.push(`background-color: ${props.color}`);
    }

    if (props.textColor) {
        styleParts.push(`color: ${props.textColor}`);
    }

    return {
        style: (styleParts.length > 0) ? styleParts.join("; ") : undefined
    };
});

const emit = defineEmits<{
    (e: "remove"): void,
}>();


const handleRemove = () => {
    emit("remove");
};

</script>
<style scoped lang="scss">
.tag {
    display: inline-flex;

    align-items: center;
    justify-content: center;
    white-space: nowrap;

    gap: 3px;
    padding: 0 6px;

    border-radius: $element-border-radius-smallest;

    button {
        @include clickable-button;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    &[data-size="small"] {
        height: steps(2);
        @include normal-text;

        button,
        :deep(.icon) {
            width: 12px;
            height: 12px;
        }
    }


    &[data-size="medium"] {
        height: steps(2.5);
        @include small-text;

        button,
        :deep(.icon) {
            width: 14px;
            height: 14px;
        }
    }

    &[data-size="large"] {
        height: steps(3);
        @include normal-text;

        button,
        :deep(.icon) {
            width: steps(2);
            height: steps(2);
        }
    }

}
</style>
