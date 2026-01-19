<template lang="pug">
FormInputField(
    v-model="value"
    :label="$t('filter.condition.Value')"
    :placeholder="$t('filter.condition.Enter value')"
    :disabled="props.disabled"
    :type="inputType"
    :decimal-places="inputDecimals"
    layout="compact")
</template>
<script setup lang="ts">
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const props = defineProps<{
    disabled?: boolean,
    definition: FilterPropertyDefinition | null,
}>();

const inputDecimals = computed(() => {
    if (props.definition?.type !== "number") {
        return undefined;
    }

    return props.definition?.decimals ?? undefined;
});

const hasDecimals = computed(() => {
    if (!inputDecimals.value) {
        return false;
    }

    return inputDecimals.value > 0;
});

const inputType = computed(() => {
    return hasDecimals.value ? "decimal" : "integer";
});

const value = defineModel<string | null>();
</script>
<style scoped lang="scss">

</style>
