<template lang="pug">
FormInputField(
    ref="field"
    v-model="value"
    :changed="valueIsManual"
    name="specification"
    :label="$t('goods_rows.fields.Specification')"
    :label-visible="goodsRowIndex === 0"
    :errors="errors"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { value, valueIsManual } = useTextFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "specification",
    manualAttribute: "specificationIsManual",
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

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    field: "specification",
});

</script>
<style scoped lang="scss"></style>
