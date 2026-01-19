<template lang="pug">
ModalDialog(v-if="show" :title="title" v-on:cancel="cancel")
    slot
        p.content {{ message }}
    template(v-if="slots['additional-content']")
        slot(name="additional-content")
    template(v-slot:actions)
        slot(name="actions")
            GenericButton(
                type="ghost"
                v-on:click="cancel"
            ) {{ cancelButtonText }}
            GenericButton(
                type="primary"
                :waiting="waiting"
                :waiting-for="waitingFor"
                v-on:click="confirm"
            ) {{ confirmButtonText }}
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
    title: string,
    cancelButtonText?: string,
    confirmButtonText?: string,
    message?: string,
    waitingFor?: WaitingFor, // auto-wait based on a defined waiter in the store
    waiting?: boolean, // or manually accept waiting state for more complex cases,

    // normally this should always be false, because the confirmation triggers an API call
    // and only if the call succeeds the dialog should be closed (from outside).
    // this optional prop is only added for compatibility with existing usage in view settings
    autoCloseOnConfirm?: boolean,
}>(), {
    autoCloseOnConfirm: false
});



const { t } = useI18n();

const slots = useSlots();

const cancelButtonText = computed(() => props.cancelButtonText || t("general.Cancel"));
const confirmButtonText = computed(() => props.confirmButtonText || t("general.Confirm"));

const emit = defineEmits<{
    (e: "confirm"): void,
    (e: "cancel"): void,
}>();

const show = defineModel<boolean>("show");

const cancel = () => {
    show.value = false;
    emit("cancel");
};

const confirm = () => {
    if (props.autoCloseOnConfirm) {
        show.value = false;
    }
    emit("confirm");
};

</script>
<style scoped lang="scss">
.content {
    width: steps(45);
}
</style>
