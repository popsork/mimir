<template lang="pug">
FormSelectField(
    v-model="value"
    filterable
    :label="$t('filter.condition.Property')"
    layout="compact"
    :options="sortedPropertyOptions"
    :placeholder="$t('filter.condition.Select')")
</template>
<script setup lang="ts">
import type { SelectOption } from "~/components/form/SelectField.vue";

const props = defineProps<{
    propertyOptions: SelectOption[],
}>();

const value = defineModel<string | null>();

const sortedPropertyOptions = computed(() => {
    return [...props.propertyOptions].sort((a, b) => a.label.localeCompare(b.label));
});
</script>
<style scoped lang="scss">

</style>
