<template lang="pug">
td(:data-name="name")
    h4 {{ $t(`history.fields.${name}`) }}
    dl.list(v-if="values")
        div(v-for="(value, key) in values" :key="key")
            dt {{ key }}
            dd {{ getValueText(value) }}
    p(v-else) {{ getBlankValueLabelText() }}
</template>
<script setup lang="ts">

defineProps<{
    name: string,
    values: Record<string, any> | null,
}>();

const getValueText = (value: any): string => {
    return JSON.stringify(value);
};

</script>
<style scoped lang="scss">
td {
    h4 {
        @include small-medium-text;
        color: $color-text-lightest;
        position: relative;
        top: steps(-0.5);
    }
    .list {
        @include block-list;
        @include small-text;

        > div {
            > dt,
            > dd {
                display: inline;
            }

            > dt::after {
                content: ": ";
            }
        }
    }
}
</style>
