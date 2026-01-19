<template lang="pug">
ButtonGroup(class="logical-operator")
    GroupButton(
        v-for="option in options"
        :key="option.value"
        :selected="value === option.value"
        v-on:click="setSelectedOption(option.value)"
    ) {{ option.label }}
</template>
<script setup lang="ts">

const { t } = useI18n();
const value = defineModel<FilterLogicalOperator>();
const options = computed(() => ([
    {
        label: t("filter.logical_operator.and"),
        value: FilterLogicalOperator.And,
    },
    {
        label: t("filter.logical_operator.or"),
        value: FilterLogicalOperator.Or,
    }
]));

const setSelectedOption = (operator: FilterLogicalOperator) => {
    value.value = operator;
};
</script>
<style scoped lang="scss">
.logical-operator {
    width: fit-content;
}

.group-button {
    text-transform: uppercase;
}
</style>
