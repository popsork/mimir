<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="articleGroupName"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormSelectField(
    v-else
    ref="field"
    v-model="articleGroupId"
    :changed="getDebitRow()?.articleGroupIdIsManual"
    v-bind="commonFieldProps"
    :options="options"
    :filterable="true"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { ArticleGroup } from "~/models/ArticleGroup";

const props = defineProps<{
    debitRowIndex: number,
    transportOrderId: string | null,
    debitRowType: DebitRowType | null,
}>();

const { t } = useI18n();
const commonFieldProps = computed(() => {
    return {
        name: "article-group",
        label: t("debit_rows.fields.Article group"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { recalculateOrder } = useOrderFormStore();

const articleGroupId = computed({
    get: () => getDebitRow()?.articleGroupId,
    set: (id: string | null) => {
        const debitRow = getDebitRow();

        if (!debitRow) {
            return;
        }

        const articleGroup = (id) ? useRepo(ArticleGroup).find(id) : null;

        debitRow.articleGroupId = id;
        debitRow.articleGroupIdIsManual = true;
        debitRow.articleGroup = articleGroup;

        // clear article if a different group gets set
        if (debitRow.articleGroupId && debitRow.article && debitRow.article.groupId !== debitRow.articleGroupId) {
            debitRow.articleId = null;
            debitRow.articleIdIsManual = true;
            debitRow.article = null;
        }
    }
});

const articleGroupName = computed(() => {
    const record = getDebitRow();
    if (!record || !record.articleGroup) {
        return "";
    }

    return record.articleGroup.name;
});

const articleGroupsStore = useOrderFormArticleGroupsStore();
const { order } = storeToRefs(useOrderFormStore());

const articleGroupsForCurrentProject = computed(() => articleGroupsStore.getArticleGroupsForProject(order.value.project));

const options = computed(() => {
    const record = getDebitRow();
    if (!record) {
        return [];
    }

    return buildSelectOptions({
        collection: articleGroupsForCurrentProject.value,
        currentObject: record.articleGroup,
        builder: (articleGroup) => {
            return {
                value: articleGroup.id,
                label: articleGroup.name
            };
        }
    });
});

articleGroupsStore.loadArticleGroupsIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "suggestedArticleGroup",
});

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};
defineExpose({
    focus
});

</script>
<style scoped lang="scss"></style>
