<template lang="pug">
FormDateField(
    v-model="value"
    type="date"
    :label="$t('filter.condition.Value')"
    :placeholder="$t('filter.condition.Enter value')"
    :disabled="props.disabled"
    layout="compact")
</template>
<script setup lang="ts">
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const props = defineProps<{
    disabled?: boolean,
    definition: FilterPropertyDefinition | null,
}>();

const value = defineModel<string | null>();
</script>
<style scoped lang="scss"></style>
