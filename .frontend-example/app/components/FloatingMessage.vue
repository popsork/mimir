<template lang="pug">
.floating-message(:data-type="props.type")
    SvgImage(class="icon" :name="icon")
    p.text {{ text }}
    GenericButton(
        v-if="closable"
        :title="$t('general.Close')"
        type="alternative-ghost"
        size="small"
        icon="cross"
        v-on:click="close"
    )
</template>
<script setup lang="ts">
const props = defineProps<{
    text: string,
    type: FloatingMessageType,
    closable: boolean,
}>();

const icon = computed(() => {
    switch (props.type) {
        case FloatingMessageType.Success:
            return "ticked-circle";
        case FloatingMessageType.Warning:
            return "warning-sign";
        case FloatingMessageType.Error:
            return "error-sign";
        default:
            return "info";
    }
});

const emit = defineEmits<{
    (e: "close"): void,
}>();

const close = () => {
    emit("close");
};

</script>
<style scoped lang="scss">
.floating-message {
    display: flex;
    align-items: center;
    gap: steps(1);
    padding: steps(1) steps(1.5);
    max-width: steps(80);
    border-radius: $element-border-radius-small;
    @include dialog-shadow;

    @include normal-medium-text;

    &[data-type="info"],
    &[data-type="default"],
    &[data-type="loading"] {
        background: $color-background-info;
    }

    &[data-type="success"] {
        background: $color-background-success;
    }

    &[data-type="error"] {
        background: $color-background-error;
    }
    &[data-type="warning"] {
        background: $color-background-warning;
    }

    &:deep(.icon) {

        & {
            flex: 0 0 steps(2.5);
        }

        &,
        svg {
            width: steps(2.5);
            height: steps(2.5);
        }
    }

}
</style>
