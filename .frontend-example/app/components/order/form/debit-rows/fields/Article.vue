<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="articleLabel"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormSelectField(
    v-else
    v-model="articleId"
    :changed="getDebitRow()?.articleIdIsManual"
    v-bind="commonFieldProps"
    :options="options"
    :filterable="true"
    :remote="true"
    :loading="waitingForSearch"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Article } from "~/models/Article";
import { ArticleGroup } from "~/models/ArticleGroup";
import type { DebitRow } from "~/models/DebitRow";

const props = defineProps<{
    debitRowIndex: number,
    transportOrderId: string | null,
    debitRowType: DebitRowType | null,
}>();

const { t } = useI18n();
const commonFieldProps = computed(() => {
    return {
        name: "article",
        label: t("debit_rows.fields.Article"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { recalculateOrder } = useOrderFormStore();

const articleId = computed({
    get: () => getDebitRow()?.articleId,
    set: (id: string | null) => {
        const debitRow = getDebitRow();

        if (!debitRow) {
            return;
        }

        let article: DebitRow["article"] = null;
        if (id) {
            if (debitRow.article?.id === id) {
                article = debitRow.article;
            } else {
                article = useRepo(Article).find(id);
            }
        }

        debitRow.articleId = id;
        debitRow.article = article;
        debitRow.articleIdIsManual = true;

        if (article) {
            // set article group from article, but only if article is set.
            // group should not be automatically removed when removing article.
            const groupId = article.groupId;
            let group: DebitRow["articleGroup"] = null;
            if (groupId) {
                if (debitRow.articleGroup?.id === groupId) {
                    group = debitRow.articleGroup;
                } else {
                    group = useRepo(ArticleGroup).find(groupId);
                }
            }

            debitRow.articleGroupId = groupId;
            debitRow.articleGroup = group;
        }
    }
});

const articleLabel = computed(() => {
    const record = getDebitRow();
    if (!record || !record.article) {
        return "";
    }

    return getArticleLabel(record.article);
});

const getArticleLabel = (article: Article) => {
    if (!selectIsOpen.value) {
        // when the field is closed and only showing its value, then only the article code should be shown
        return article.code;
    }

    // when the option list is open, the options should show "code | name (group)"
    const codeAndNameParts = [
        article.code
    ];

    if (article.name) {
        codeAndNameParts.push(article.name);
    }

    const parts = [
        codeAndNameParts.join(" | ")
    ];

    if (article.groupName) {
        parts.push(`(${article.groupName})`);
    }

    return parts.join(" ");
};

const store = useOrderFormArticlesStore();
store.reset();

const { articles, searchQuery } = storeToRefs(store);

const waitingForSearch = computed(() => {
    const record = getDebitRow();
    if (!record) {
        return false;
    }
    return store.waitingForSearch(searchQuery.value, record.id);
});

const options = computed(() => {
    const record = getDebitRow();
    if (!record) {
        return [];
    }

    return buildSelectOptions({
        collection: articles.value,
        currentObject: record.article,
        builder: (article) => {
            return {
                value: article.id,
                label: getArticleLabel(article)
            };
        }
    });
});

const { order } = storeToRefs(useOrderFormStore());

const searchArticles = (query: string) => {
    const record = getDebitRow();
    if (!record) {
        return;
    }

    const projectId = order.value.projectId;
    const articleGroupId = record.articleGroupId;
    const debitRowId = record.id;
    const maxNumberOfArticles = 50;

    store.performSearch({ query, projectId, articleGroupId, maxNumberOfArticles, debitRowId });
};

const selectIsOpen = ref(false);

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        selectIsOpen.value = true;

        // when opening the field, perform search with empty query to show all articles
        searchArticles("");
        return;
    }

    // since the search results are currently stored in a single store,
    // they need to be cleared so that results from search in one debit row do not show up in another.
    // closing the field is a reasonable point to clear them.
    // this means that when reopening the same field after closing, the search will be performed again.
    // this could maybe be improved by storing the search results separately for each debit row,
    // but it's not clear that reopening the field should actually show the same results again,
    // because when the field got closed the conditions for search already changed - there is no longer any text
    // in the search field, and also a group might have been automatically set, which affects the conditions as well.
    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
    selectIsOpen.value = false;
};

const handleSearch = (query: string) => {
    searchArticles(query);
};

const clearSearchResults = () => {
    store.reset();
};

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "article",
});


</script>
<style scoped lang="scss"></style>
