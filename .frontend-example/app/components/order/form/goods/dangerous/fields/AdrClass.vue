<template lang="pug">
FormInputField(
    ref="field"
    v-model="value"
    name="adr-class"
    :label="$t('dangerous_goods_rows.fields.ADR class')"
    :label-visible="rowIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { recalculateOrder } = useOrderFormStore();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { value } = useTextFieldValue({
    recordAccessor: getDangerousGoodsRow,
    valueAttribute: "adrClass",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "adr_class",
});


</script>
<style scoped lang="scss"></style>
