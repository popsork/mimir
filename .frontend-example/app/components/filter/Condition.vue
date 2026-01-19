<template lang="pug">
.fields
    .key-operator-group
        FilterConditionFieldsProperty(v-model="modelValue.key" :property-options="propertyOptions")
        FilterConditionFieldsComparisonOperator(v-model="modelValue.operator" class="comparison-operator-field" :definition="propertyDefinition")
    component(:is="valueComponent" v-model="modelValue.value" :disabled="valueIsDisabled" :definition="propertyDefinition")
</template>
<script setup lang="ts">
import type { SelectOption } from "~/components/form/SelectField.vue";
import {
    FilterConditionFieldsDateValue,
    FilterConditionFieldsNumberValue,
    FilterConditionFieldsStringValue,
    FilterConditionFieldsEnumValue,
    FilterConditionFieldsRelativeDateValue,
} from "#components";
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const props = defineProps<{
    properties: FilterPropertyDefinition[],
}>();

const propertyOptions = computed(() => {
    return props.properties.map(p => ({
        value: p.key,
        label: p.label,
    })) as SelectOption[];
});

const modelValue = defineModel<FilterCondition>({
    default: {
        key: null,
        operator: null,
        value: null,
    }
});

const propertyDefinition = computed(() => {
    if (!modelValue.value || !modelValue.value.key) {
        return null;
    }

    return props.properties.find(p => p.key === modelValue.value.key) ?? null;
});

const valueDisabledOperators = [
    FilterComparisonOperator.Blank,
    FilterComparisonOperator.NotBlank,
];

const valueIsDisabled = computed(() => {
    if (valueDisabledOperators.includes(modelValue.value.operator!)) {
        return true;
    }

    if (!modelValue.value.key) {
        return true;
    }

    return false;
});

const getDateComponent = () => {
    if (modelValue.value.operator === FilterComparisonOperator.Relative) {
        return FilterConditionFieldsRelativeDateValue;
    }

    return FilterConditionFieldsDateValue;
};

const valueComponent = computed(() => {
    //
    // Fallback to StringValue if no definition was found.
    if (!propertyDefinition.value) {
        return FilterConditionFieldsStringValue;
    }

    switch (propertyDefinition.value.type) {
        case "date": return getDateComponent();
        case "number": return FilterConditionFieldsNumberValue;
        case "enum": return FilterConditionFieldsEnumValue;
    }

    return FilterConditionFieldsStringValue;
});

</script>
<style scoped lang="scss">
.key-operator-group {
    display: flex;
    gap: steps(0.5);

    .comparison-operator-field {
        flex: 0 0 steps(11);
    }
}
</style>
