<template lang="pug">
.shortcut
    FormInputField(
        :label="$t('views.view_settings.fields.Shortcut')"
        size="large"
        layout="compact"
        :model-value="internalValue"
        :errors="errors"
        :disabled="props.disabled"
        clearable
        v-on:update:model-value="updateFieldValue"
        v-on:keyup.prevent="onKeyUp"
        v-on:keydown.prevent="onKeyDown"
    )
    p(v-if="props.disabled" class="shortcut-disabled-message") {{ $t("views.view_settings.shortcut.Disabled") }}
</template>
<script setup lang="ts">

import type { View, ViewConfig } from "~/models/View";

const props = defineProps<{
    disabled: boolean,
    view: View<ViewConfig>,
}>();

const viewsStore = useViewsStore();
const views = computed(() => viewsStore.getViewsByContext(props.view.context));

const { t } = useI18n();

const listen = ref(false);
const value = defineModel<string | null>();
const internalValue = ref("");

const { currentlyPressedShortcut } = usePressedKeysTracking();

const systemShortcuts = computed(() => Object.values<string>(OrderListShortcut));
const viewShortcuts = computed(() => views.value.filter(v => v.shortcut && v.id !== props.view.id).map(v => v.shortcut));

const shortcutIsSystem = computed(() => systemShortcuts.value.includes(internalValue.value));
const shortcutIsTaken = computed(() => viewShortcuts.value.includes(internalValue.value));

const errors = computed(() => {
    const errors = [];
    if (shortcutIsSystem.value) {
        errors.push({ message: t("views.view_settings.shortcut.errors.System shortcut") });
    }

    if (shortcutIsTaken.value) {
        errors.push({ message: t("views.view_settings.shortcut.errors.Taken shortcut") });
    }

    return errors;
});

//
// Used for "listening" for when the user presses the clear button in the input field
// and thus clearing the value and internalValue. If the user somehow manages to
// update the text in the field manually we just ignore that.
const updateFieldValue = (v: string | number | null | undefined) => {
    console.log("updateFieldValue", v);
    if (v) {
        return;
    }

    value.value = null;
    internalValue.value = "";
};

//
// onKeyUp and onKeyDown is used for two parts. Firstly keeps track whether
// we should "use" the current shortcut, the idea is that when the user is
// pushing down keys and not releasing them, they want to create/update the shortcut
// with more keys. As soon as they release one of the keys we stop update
// the shortcut.
const onKeyUp = (e: KeyboardEvent) => {
    listen.value = false;

    //
    // If the user hits the escape key, reset the internal value
    // to the model-value. This is used then the user tries to set
    // a shortcut that is already taken by either the system or another
    // view. Then the user can hit escape and restore the previous set value.
    if (e.key === "Escape") {
        internalValue.value = value.value || "";
    }
};

const onKeyDown = (_e: KeyboardEvent) => {
    listen.value = true;
};

//
// When the "currentShortcut" is changed we check we are in "listening" mode.
// If the shortcut is taken or a system shortcut, we only update the internal
// value and displays an error message for the user. Otherwise we also updates
// the model-value (which updates the selectedView shortcut)
watch(currentlyPressedShortcut, () => {
    if (!currentlyPressedShortcut.value || !listen.value) {
        return;
    }

    internalValue.value = currentlyPressedShortcut.value;
    if (!shortcutIsTaken.value && !shortcutIsSystem.value) {
        value.value = currentlyPressedShortcut.value;
    }
});

//
// If the model-value is updated from the outside, like if the user hits
// "Revert view", we need to restore the internalValue to whatever model-value is
watch(value, () => {
    internalValue.value = value.value || "";
}, { immediate: true });
</script>
<style scoped lang="scss">
.shortcut-disabled-message {
    padding: steps(.5);
    color: $color-text-info;
}
</style>
