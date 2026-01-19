<template lang="pug">
.operators
    GenericButton(
        v-if="buttonsVisible && andButtonVisible"
        type="quaternary"
        size="small"
        icon="plus"
        icon-placement="before"
        v-on:click="addAndCondition"
    ) {{ $t('filter.logical_operator.and') }}

    GenericButton(
        v-if="buttonsVisible && orButtonVisible"
        type="quaternary"
        size="small"
        icon="plus"
        icon-placement="before"
        v-on:click="addOrCondition"
    ) {{ $t('filter.logical_operator.or') }}

    span(v-if="!buttonsVisible" class="group-operator-text") {{ $t(`filter.logical_operator.${group.operator}`) }}
</template>
<script setup lang="ts">

const props = defineProps<{
    filterIndex: number,
}>();

const group = defineModel<FilterConditionGroup>("group", {
    default: {
        operator: null,
        filters: []
    }
});

const filters = computed(() => group.value?.conditions);
const isOnlyFilter = computed(() => filters.value && filters.value.length === 1);
const isLastFilter = computed(() => !filters.value || props.filterIndex === filters.value.length - 1);

const buttonsVisible = computed(() => {
    if (!filters.value || filters.value.length === 0) {
        return true;
    }

    if (isOnlyFilter.value) {
        return true;
    }

    return isLastFilter.value;
});

const addAndCondition = () => {
    if (!filters.value || !group.value) {
        return;
    }

    group.value.conditions.push(getEmptyFilterCondition());
    group.value.operator = FilterLogicalOperator.And;
};

const addOrCondition = () => {
    if (!filters.value || !group.value) {
        return;
    }

    group.value.conditions.push(getEmptyFilterCondition());
    group.value.operator = FilterLogicalOperator.Or;
};

const andButtonVisible = computed(() => isOnlyFilter.value || group.value?.operator === FilterLogicalOperator.And);
const orButtonVisible = computed(() => isOnlyFilter.value || group.value?.operator === FilterLogicalOperator.Or);
</script>
<style scoped lang="scss">
.group-operator-text {
    display: block;
    @include single-line-body-small-strong-text;
    color: $color-text-lightest;
    padding-left: steps(1);
    text-transform: uppercase;
}

.operators {
    .button {
        text-transform: uppercase;
    }
}
</style>
