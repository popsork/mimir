<template lang="pug">
.scopes
    FormRadioField(
        v-for="option in options"
        :key="option.value"
        v-model="selectedScope"
        name="scope"
        :value="option.value"
        :label="option.label")
</template>
<script setup lang="ts">

const { t } = useI18n();
const searchStore = useSearchStore();
const { filterableScopes, selectedScope } = storeToRefs(searchStore);

const options = computed(() => {
    return filterableScopes.value.map(scope => ({
        value: scope.key,
        label: t(`search.scopes.${scope.key}`) + ` (${scope.hits})`,
    }));
});
</script>
<style scoped lang="scss">
.scopes {
    display: flex;
    flex-direction: column;
    row-gap: steps(.5);
}
</style>
