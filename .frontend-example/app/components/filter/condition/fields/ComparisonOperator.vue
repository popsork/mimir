<template lang="pug">
FormSelectField(
    v-model="value"
    filterable
    :label="$t('filter.condition.Operator')"
    layout="compact"
    :placeholder="$t('filter.condition.Select')"
    :options="options")
</template>
<script setup lang="ts">
import type { SelectOption } from "~/components/form/SelectField.vue";
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const value = defineModel<FilterComparisonOperator | null>();
const { t } = useI18n();

const props = defineProps<{
    definition: FilterPropertyDefinition | null,
}>();

const allOperators = Object.values(FilterComparisonOperator);
const allOperatorsExcept = (...except: FilterComparisonOperator[]) => allOperators.filter(op => !except.includes(op));

const operatorsForType: Record<TableColumnDefinition["type"], FilterComparisonOperator[]> = {
    "string": allOperatorsExcept(FilterComparisonOperator.Relative, FilterComparisonOperator.GreaterThan, FilterComparisonOperator.GreaterThanOrEqual, FilterComparisonOperator.LessThan, FilterComparisonOperator.LessThanOrEqual),
    "date": allOperatorsExcept(FilterComparisonOperator.Matches, FilterComparisonOperator.NotMatches),
    "number": allOperatorsExcept(FilterComparisonOperator.Matches, FilterComparisonOperator.NotMatches, FilterComparisonOperator.Relative),
    "boolean": [FilterComparisonOperator.Equals, FilterComparisonOperator.NotEquals, FilterComparisonOperator.Blank, FilterComparisonOperator.NotBlank],
    "enum": [FilterComparisonOperator.Equals, FilterComparisonOperator.NotEquals, FilterComparisonOperator.Blank, FilterComparisonOperator.NotBlank],
};

const operatorToOption = (value: string) => ({
    label: t(`filter.comparison_operator.${value}`),
    value,
});

const options = computed<SelectOption[]>(() => {
    if (!props.definition || !operatorsForType[props.definition.type]) {
        return allOperators.map(operatorToOption);
    }

    return operatorsForType[props.definition.type].map(operatorToOption);
});
</script>
<style scoped lang="scss"></style>
