<template lang="pug">
aside.sidebar
    template(v-if="query")
        .header
            p.label {{ $t('search.Search results for') }}
            p.query &#8220;{{ query }}&#8221;
        SearchScopesField
        SearchFilters
</template>
<script setup lang="ts">
const searchStore = useSearchStore();

const { query } = storeToRefs(searchStore);
</script>
<style scoped lang="scss">
.sidebar {
    padding: steps(2);

    .header {
        margin-bottom: steps(2);

        .label {
            @include small-text;
            color: $color-text-lightest;
        }

        .query {
            @include normal-medium-text; // Figma specified normal-strong-text, but I feel like medium looks better in the browser
        }
    }
}
</style>
