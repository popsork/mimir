<template lang="pug">
p.field(:data-name="name")
    span.label {{ label }}
    span.value(:class="{ 'highlighted': highlightValue }") {{ value }}
</template>
<script setup lang="ts">
defineProps<{
    name: string,
    label: string,
    value: string,
    highlightValue?: boolean,
}>();
</script>
<style scoped lang="scss">
.field {

    display: inline-flex;
    gap: steps(1);

    .label::after {
        content: ":";
    }

    .value.highlighted {
        @include normal-strong-text;
    }

}
</style>
