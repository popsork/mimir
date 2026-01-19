<template lang="pug">
form(ref="form" method="post" novalidate v-on:submit.prevent  v-on:keydown="preventSubmissionWithEnterKeyIfNeeded")
    slot
</template>
<script setup lang="ts">

const props = defineProps<{
    preventSubmissionOnEnter?: boolean,
}>();

const form = useTemplateRef<HTMLFormElement>("form");

const { inputFocused } = useFocusTracking();

const preventSubmissionWithEnterKeyIfNeeded = (event: KeyboardEvent) => {
    // some forms should not allow saving by hitting the enter key in an input.
    // for example, in dropdown fields the enter key opens/closes the option list,
    // in textareas it creates a new line, in popover fields it opens the popover,,
    // in date pickers it confirms the value and closes the popup etc,
    // so it would not be good if in some text fields the enter key suddenly submitted the form.

    if (!props.preventSubmissionOnEnter) {
        return;
    }

    if (event.key === "Enter" && inputFocused.value) {
        event.preventDefault();
    }
};

const submit = () => {
    if (form.value) {
        // dispatching a custom event is needed for the event to work as the native submit event caused by the user.
        // calling form.value.submit() would trigger the submission directly without the possibility to handle it.
        form.value.dispatchEvent(new Event("submit", { cancelable: true }));
    }
};

defineExpose({
    submit
});

</script>
<style scoped lang="scss"></style>




