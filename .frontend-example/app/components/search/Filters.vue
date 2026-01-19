<template lang="pug">
.filters
    .header {{ $t('search.filter.builder.title') }}
    FilterBuilder(v-model="filters" :properties="properties")
</template>
<script setup lang="ts">
import type { FilterPropertyDefinition } from "~/components/filter/Builder.vue";

const { t } = useI18n();
const searchStore = useSearchStore();
const { selectedScope } = storeToRefs(searchStore);

const getSelectedStore = () => {
    return searchStore.getStoreForScope(selectedScope.value);
};

const getTranslationScope = (scope:SearchScope) => {
    switch (scope) {
        case SearchScope.Orders: return "orders.list.columns";
        case SearchScope.Customers:
        case SearchScope.Articles:
        case SearchScope.Specifications:
        case SearchScope.Deviations:
            return `search.table.${scope}`;
    }
};

const properties = computed(() => {
    const store = getSelectedStore();
    const translationKey = getTranslationScope(selectedScope.value);
    if (!store) {
        return [];
    }

    return Object.entries(store.columns).map(([key, definition]) => ({
        key,
        label: t(`${translationKey}.${key}`),
        ...definition,
    })) as FilterPropertyDefinition[];
});

const filters = computed(() => {
    const store = getSelectedStore();
    if (!store) {
        return {
            groups: [],
            operator: FilterLogicalOperator.And,
        };
    }

    return store.filters;
});
</script>
<style scoped lang="scss">
:deep(.group) {
    + .actions {
        margin-top: steps(4.5);
    }
}

.operator {
    margin-bottom: steps(3);
}

.filters {
    border-top: 1px solid $color-border-normal;
    margin: steps(3) 0;
    padding-top: steps(1.5);

    .header {
        padding-bottom: steps(1.5);
        @include normal-medium-text;
    }
}
</style>
