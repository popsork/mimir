<template lang="pug">
GenericForm(method="get" v-on:submit.prevent="submitSearch")
    FormInputField(
        v-model="query"
        name="query"
        type="search"
        :placeholder="t('search.header.placeholder')"
        v-on:keydown.escape="clearSearch"
    )
        template(v-slot:suffix)
            button(type="submit" :title="t('search.header.Search')")
                SvgImage(name="search")

</template>
<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const query = ref(route.query.query as string | null);

const submitSearch = () => {
    if (query.value === "") {
        return;
    }
    goToRoute({ name: "search", query: { query: query.value } });
};

const clearSearch = () => {
    query.value = "";
};

</script>
<style scoped lang="scss">
form {
    width: steps(56);
}
</style>
