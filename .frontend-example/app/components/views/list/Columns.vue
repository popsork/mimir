<template lang="pug">
h3.selected-columns {{ $t('views.list.columns.Show') }}
p(v-if="!selectedColumns.length") {{ getBlankValueLabelText() }}
VueDraggable(
    v-model="selectedColumns"
    handle=".column"
    ghost-class="column-ghost"
    chosen-class="column-chosen"
    class="sorter"
)
    .column(v-for="selectedColumn in selectedColumns" :key="selectedColumn.key")
        SvgImage(name="hamburger")
        span {{ getColumnLabel(selectedColumn.key) }}
        GenericButton(
            name="remove"
            icon="cross"
            type="alternative-ghost"
            size="small"
            :title="$t('views.list.columns.Remove')"
            v-on:click="removeColumn(selectedColumn)")
h3.non-selected-columns {{ $t('views.list.columns.Other columns') }}
.column-search
    FormInputField(
        v-model="searchValue"
        type="search"
        :placeholder="$t('views.list.columns.Search')"
        v-on:keydown.escape="clearSearch"
        v-on:keydown.enter="addColumnInSearch")
        template(v-slot:suffix)
            button(type="submit" :title="$t('views.list.columns.Search')" v-on:click="clearSearch")
                SvgImage(:name="searchValue.length ? 'cross' : 'search'")
.available-column(v-for="nonSelectedColumn in nonSelectedColumns" :key="nonSelectedColumn.key" :data-hidden="!matchingNonSelectedColumnKeys.includes(nonSelectedColumn.key)")
    span {{ getColumnLabel(nonSelectedColumn.key) }}
    GenericButton(
        name="add"
        data-name="add"
        type="ghost"
        size="small"
        v-on:click="addColumn(nonSelectedColumn)") {{ $t('views.list.columns.Add') }}
</template>
<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type { GenericTableColumn } from "~/types/GenericTableColumn";

const { t } = useI18n();

const emit = defineEmits<{
    (e: "addColumn", column: GenericTableColumn): void,
    (e: "removeColumn", column: TableViewColumn): void,
}>();

const props = defineProps<{
    columns: GenericTableColumn[],
    translationScope: string,
}>();

const selectedColumns = defineModel<TableViewColumn[]>("selectedColumns", {
    required: true
});

const columnLabels = computed(() => {
    const labels = {} as Record<string, string>;
    for (const column of props.columns) {
        labels[column.key] = t(`${props.translationScope}.${column.key}`);
    }

    return labels;
});

const getColumnLabel = (columnKey: string) => columnLabels.value[columnKey] ?? columnKey;

const searchValue = ref("");
const lowerCaseSearchValue = computed(() => searchValue.value.toLocaleLowerCase(getCurrentLocale()).replace(/\s+/g, " ").trim());

const clearSearch = () => {
    searchValue.value = "";
};

const columnMatchesSearchQuery = (column: GenericTableColumn) => {
    if (!searchValue.value) {
        return true;
    }

    return getColumnLabel(column.key).toLocaleLowerCase(getCurrentLocale()).includes(lowerCaseSearchValue.value);
};

const selectedColumnKeys = computed(() => selectedColumns.value.map(column => column.key));
const matchingNonSelectedColumnKeys = computed(() => {
    const nonSelectedColumns = props.columns
        .filter(col => !selectedColumnKeys.value.includes(col.key));

    if (!searchValue.value) {
        return nonSelectedColumns.map(column => column.key);
    }

    return nonSelectedColumns
        .filter(column => columnMatchesSearchQuery(column))
        .map(column => column.key);
});

const nonSelectedColumns = computed(() => {
    return props.columns
        .filter(col => !selectedColumnKeys.value.includes(col.key))
        .sort((a, b) => {
            if (matchingNonSelectedColumnKeys.value.includes(a.key) && matchingNonSelectedColumnKeys.value.includes(b.key)) {
                return getColumnLabel(a.key).localeCompare(getColumnLabel(b.key), getCurrentLocale());
            }

            return matchingNonSelectedColumnKeys.value.includes(a.key) ? -1 : 1;
        });
});

const addColumn = (column: GenericTableColumn) => {
    emit("addColumn", column);
};

const removeColumn = (column: TableViewColumn) => {
    emit("removeColumn", column);
};

const addColumnInSearch = () => {
    if (!searchValue.value.length || matchingNonSelectedColumnKeys.value.length !== 1) {
        return;
    }

    const columnKey = matchingNonSelectedColumnKeys.value[0]!;

    const column = props.columns.find(column => column.key === columnKey);
    if (!column) {
        return;
    }

    addColumn(column);
    clearSearch();
};
</script>
<style scoped lang="scss">
h3.selected-columns,
h3.non-selected-columns {
    @include small-medium-text;
    color: $color-text-normal;
    padding-bottom: steps(0.5);
}

h3.non-selected-columns {
    margin-top: steps(2);
    padding-top: steps(3);
    border-top: 1px solid $color-background-light;
}

.sorter {
    :deep(.column-ghost) {
        background-color: $color-text-normal;
    }

    :deep(.column-chosen) {
        background-color: $color-background-light;
    }

    :deep(.column) {
        @include small-medium-text;
        color: $color-text-normal;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: steps(0.5);
        gap: steps(0.5);
        margin-bottom: steps(0.5);
        cursor: move;
        background-color: $color-background-light;
        border-radius: $element-border-radius;

        [data-name="remove"] {
            margin-left: auto;
            cursor: pointer;
        }

    }
}

.column-search {
    padding: steps(1.5) 0;
}

.available-column {
    @include small-medium-text;
    color: $color-text-normal;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    padding: steps(0.5) steps(0.5) steps(0.5) 0;
    border-bottom: 1px solid $color-background-light;

    [data-name="add"] {
        margin-left: auto;
    }

    &[data-hidden="true"] {
        visibility: hidden;
    }
}
</style>
