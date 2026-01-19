<template lang="pug">
FilterExpressionLogicalOperatorField(v-model="value.operator" class="operator")
FilterConditionGroup(
    v-for="(group, index) in groups"
    :key="index"
    v-model="groups[index]"
    :properties="props.properties"
    :expression-operator="value.operator"
    v-on:remove="removeFilterConditionGroup(index)")

.actions
    GenericButton(type="secondary" icon="plus-circled" v-on:click="addFilterConditionGroup") {{ $t('filter.Add filter group') }}
</template>
<script setup lang="ts">
export type FilterPropertyDefinition = TableColumnDefinition & {
    key: string,
    label: string,
};

const props = defineProps<{
    properties: FilterPropertyDefinition[],
}>();

const value = defineModel<FilterExpression>({
    default: {
        operator: FilterLogicalOperator.And,
        groups: []
    }
});

const groups = computed<FilterConditionGroup[]>(() => value.value.groups);

const addFilterConditionGroup = () => {
    value.value.groups.push(getEmptyConditionGroup());
};

const removeFilterConditionGroup = (index: number) => {
    value.value.groups.splice(index, 1);
};
</script>
<style scoped lang="scss">
:deep(.group) {
    + .actions {
        margin-top: steps(2.5);
    }
}

.operator {
    margin-bottom: steps(2.5);
}
</style>
