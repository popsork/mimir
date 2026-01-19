<template lang="pug">
NModal(v-bind="modalProps")
    .modal-dialog
        .header
            h2.title {{ title }}
            GenericButton(
                :title="$t('general.Close')"
                type="alternative-ghost"
                size="small"
                icon="cross"
                v-on:click="cancel"
            )
        slot
        .actions(v-if="slots.actions")
            slot(name="actions")
</template>
<script setup lang="ts">

defineProps<{
    title: string,
}>();

const slots = useSlots();

const modalProps = computed(() => {
    return {
        show: true,
        autoFocus: false,
        onEsc: cancel,
        onMaskClick: cancel,
    };
});

const emit = defineEmits<{
    (e: "open"): void,
    (e: "cancel"): void,
}>();

const cancel = () => {
    emit("cancel");
};

onMounted(() => {
    emit("open");
});

</script>
<style scoped lang="scss">
.modal-dialog {
    position: relative;
    padding: steps(2);

    background: $color-background-lightest;
    border-radius: $dialog-border-radius;

    @include dialog-shadow;

    .header {
        position: relative;
        margin-bottom: steps(2);

        .title {
            @include large-heading;
        }

        .button {
            position: absolute;
            right: steps(-1);
            top: steps(-1);

        }
    }

    .actions {
        margin-top: steps(2);
        gap: steps(2);
        display: flex;
        justify-content: flex-end;
    }
}
</style>
<style lang="scss">
.n-modal-mask {
    background: $color-background-translucent;
}
</style>
