<template lang="pug">
table(:data-name="name")
    colgroup
        col(v-for="column in columns" :key="column.name" :data-name="column.name")
    thead
        tr
            th(v-for="column in columns" :key="column.name" scope="column" :data-name="column.name") {{ column.label }}
    tbody
        template(v-if="numberOfRows > 0")
            slot
        template(v-else)
            tr
                td.no-entries(:colspan="numberOfColumns")
                    slot(name="no-entries")
</template>
<script setup lang="ts">

const props = defineProps<{
    name: string,
    columns: { name: string, label: string | null }[],
    numberOfRows: number,
}>();

const numberOfColumns = computed(() => props.columns.length);


</script>
<style scoped lang="scss">
table {
    width: 100%;
    table-layout: fixed;

    thead th {
        @include small-medium-text;
        color: $color-text-lightest;
        text-align: left;
    }

    :deep(tr) {
        th,
        td {
            height: steps(4); // acts as minimum height
            padding: steps(0.5) steps(1.5);
        }
    }

    .no-entries {
        text-align: center;
        padding: steps(2);
    }

    tbody :deep(tr) {

        border-bottom: 1px solid $color-border-normal;

        td {
            @include word-break;
            text-align: left;
            vertical-align: top;

            @include normal-text;
        }

    }
}
</style>
