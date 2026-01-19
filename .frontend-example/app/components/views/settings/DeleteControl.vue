<template lang="pug">
GenericButton(
    type="tertiary"
    icon="trash-can"
    :disabled="props.disabled"
    :waiting-for="WaitingFor.ViewDelete"
    v-on:click="showConfirmDialog"
) {{ $t('views.view_settings.actions.Delete view') }}
ConfirmationDialog(
    v-model:show="showConfirm"
    :confirm-button-text="$t('views.view_settings.actions.Delete view')"
    :message="confirmationMessageText"
    :title="$t('views.view_settings.actions.Delete view')"
    :auto-close-on-confirm="true"
    v-on:confirm="deleteView"
)
</template>
<script setup lang="ts">
const emit = defineEmits<{
    (e: "delete"): void,
}>();

const props = defineProps<{
    viewName: string,
    disabled: boolean,
}>();

const { t } = useI18n();
const showConfirm = ref(false);

const confirmationMessageText = computed(() => {
    return t("views.view_settings.delete.Delete view message", {
        viewName: props.viewName,
    });
});

const deleteView = () => {
    emit("delete");
};

const showConfirmDialog = () => {
    showConfirm.value = true;
};
</script>
<style scoped lang="scss">
.button {
    width: 100%;
    margin-bottom: steps(5);
}
</style>
