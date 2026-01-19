<template lang="pug">
.group
    .filter(v-for="(condition, conditionIndex) in conditions" :key="conditionIndex")
        .condition
            FilterCondition(v-model="group.conditions[conditionIndex]" :properties="props.properties")
            FilterConditionActions(v-on:remove="removeCondition(conditionIndex)")
        FilterGroupLogicalOperatorButtons(v-model:group="group" :filter-index="conditionIndex")
    FilterGroupDivider {{ $t(`filter.logical_operator.${props.expressionOperator}`) }}
</template>
<script setup lang="ts">
import type { FilterLogicalOperator } from "~/enums/FilterLogicalOperator";
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const emit = defineEmits<{
    (e: "remove"): void,
}>();

const props = defineProps<{
    properties: FilterPropertyDefinition[],
    expressionOperator: FilterLogicalOperator,
}>();

const modelValue = defineModel<FilterConditionGroup>({
    default: {
        operator: null,
        filters: [
            {
                key: null,
                operator: null,
                value: null,
            }
        ]
    }
});

//
// This is here to make PHPStorm happy.
const group = computed<FilterConditionGroup>(() => modelValue.value);
const conditions = computed<FilterCondition[]>(() => modelValue.value.conditions);

const removeCondition = (index:number) => {
    modelValue.value.conditions.splice(index, 1);

    if (modelValue.value.conditions.length === 0) {
        emit("remove");
    }
};
</script>
<style scoped lang="scss">
.group {
    .filter {
        display: flex;
        flex-direction: column;

        .condition {
            display: flex;
        }

        .fields {
            flex: 1 1 auto;

            display: flex;
            flex-direction: column;
            gap: steps(.5);
        }

        .actions {
            flex: 0 0 auto;
            padding-left: steps(.25);
        }

        .operators {
            margin-top: steps(1);
            width: 100%;
            display: flex;
            gap: steps(1);
        }

        + .filter {
            margin-top: steps(1);
        }
    }

    + .group {
        margin-top: steps(3);
    }

    :deep(.n-divider) {
        @include body-small-strong-text;
        color: $color-text-lightest;
    }
}
</style>
