<template lang="pug">
span.value {{ displayText }}
</template>
<script setup lang="ts">
const { t } = useI18n();

const modelValue = defineModel<number | null>({ required: true });
const props = defineProps<{
    sign: "+" | "-",
}>();

const displayValue = computed(() => modelValue.value === null ? "∞" : Math.abs(modelValue.value));

const displayText = computed(() => {
    return `${props.sign} ${displayValue.value} ${t("orders.map.filters.Date.days")}`;
});
</script>
<style scoped lang="scss">
.value {
    min-width: steps(6.5);
    white-space: nowrap;
}
</style>
