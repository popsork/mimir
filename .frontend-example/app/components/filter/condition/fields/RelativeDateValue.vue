<template lang="pug">
FilterFieldsRelativeDate(v-model:days-in-future="daysInFuture" v-model:days-in-past="daysInPast")
</template>
<script setup lang="ts">
const modelValue = defineModel<string | null>();
const internalValue = computed({
    get() {
        if (!modelValueIsValid.value) {
            return [0, 0];
        }

        return JSON.parse(modelValue.value!);
    },

    set(val) {
        modelValue.value = JSON.stringify(val);
    }
});

const daysInFuture = computed({
    get() {
        return internalValue.value[1];
    },

    set(val) {
        internalValue.value = [internalValue.value[0], val];
    }
});

const daysInPast = computed({
    get() {
        return internalValue.value[0];
    },

    set(val) {
        internalValue.value = [val, internalValue.value[1]];
    }
});

const modelValueIsValid = computed(() => {
    if (!modelValue.value) {
        return false;
    }

    try {
        const parsedValue = JSON.parse(modelValue.value);
        if (parsedValue.length !== 2) {
            return false;
        }

        if (typeof parsedValue[0] !== "number" || typeof parsedValue[1] !== "number") {
            return false;
        }
    } catch {
        return false;
    }

    return true;
});

//
// watch that the model value is valid (i.e. is a JSON with two numbers in it)
// reset the value to 0, 0 to make the component and filtering works. This is here
// because when the user selects a date and chooses to use the "Relative" operator
// they probably expect the filter to apply immediately as it contains data (today +/- 0 days)
// otherwise they would have to actually add/subtract days before the filter applied.
watch(modelValueIsValid, (isValid) => {
    if (!isValid) {
        modelValue.value = JSON.stringify([0, 0]);
    }
}, { immediate: true });
</script>
<style scoped lang="scss">

</style>
