<template lang="pug">
FormInputField(
    ref="field"
    v-model="value"
    name="specification"
    :label="$t('dangerous_goods_rows.fields.Specification')"
    :label-visible="rowIndex === 0"
    :errors="errors"
)
</template>
<script setup lang="ts">
const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { value } = useTextFieldValue({
    recordAccessor: getDangerousGoodsRow,
    valueAttribute: "specification",
});


const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "specification",
});

</script>
<style scoped lang="scss"></style>
