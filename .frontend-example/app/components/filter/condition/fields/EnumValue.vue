<template lang="pug">
FormSelectField(
    v-if="options"
    v-model="value"
    :label="$t('filter.condition.Value')"
    :disabled="props.disabled"
    :options="options"
    layout="compact")
</template>
<script setup lang="ts">
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";
import type { SelectOption } from "~/components/form/SelectField.vue";

const { t } = useI18n();

const props = defineProps<{
    disabled?: boolean,
    definition: FilterPropertyDefinition | null,
}>();

const options = computed(() => {
    if (props.definition?.type !== "enum") {
        return;
    }

    const translationScope = props.definition.translationScope;

    return Object.values(props.definition.enum).map(value => ({
        label: t(`${translationScope}.${value}`),
        value,
    })) as SelectOption[];
});

const value = defineModel<string | null>();
</script>
<style scoped lang="scss">

</style>
