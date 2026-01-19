<template lang="pug">
.search
    SearchSidebar
    SearchResults
</template>
<script setup lang="ts">
const route = useRoute();
const searchStore = useSearchStore();
const { query } = storeToRefs(searchStore);

watch(() => route.query.query, () => {
    query.value = route.query.query as string | null;
}, { immediate: true });

const { t } = useI18n();

const titleParts = computed(() => {
    const parts = [] as string[];

    if (query.value) {
        parts.push(query.value.toString());
    }

    parts.push(t("pages.titles.Search"));

    return parts;
});

usePageTitle({ parts: titleParts });
</script>
<style scoped lang="scss">
.search {
    display: flex;
    height: 100%;

    .sidebar {
        height: 100%;
        width: 320px;
        flex: 0 0 auto;
        background-color: $color-background-lighter;
    }

    .results {
        flex: 1 1 auto;
    }
}
</style>
