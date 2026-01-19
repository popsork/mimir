<template lang="pug">
FormSelectField(
    v-model="wasteCodeId"
    name="waste-code"
    :label="$t('dangerous_goods_rows.fields.Waste code')"
    :label-visible="rowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { WasteCode } from "~/models/WasteCode";

const props = defineProps<{
    dangerousGoodsRowId: string,
    rowIndex: number,
}>();

const { getDangerousGoodsRow } = useOrderFormDangerousGoodsRowAccessor(() => props.dangerousGoodsRowId);

const { recalculateOrder } = useOrderFormStore();

const wasteCodeId = computed({
    get: () => getDangerousGoodsRow()?.wasteCodeId,
    set: (id: string | null) => {
        const dangerousGoodsRow = getDangerousGoodsRow();

        if (!dangerousGoodsRow) {
            return;
        }

        const wasteCode = (id) ? useRepo(WasteCode).find(id) : null;

        dangerousGoodsRow.wasteCodeId = id;
        dangerousGoodsRow.wasteCode = wasteCode;
    }
});


const store = useOrderFormWasteCodesStore();
const { wasteCodes } = storeToRefs(store);

const options = computed(() => {
    const dangerousGoodsRow = getDangerousGoodsRow();
    if (!dangerousGoodsRow) {
        return [];
    }

    return buildSelectOptions({
        collection: wasteCodes.value,
        currentObject: dangerousGoodsRow.wasteCode,
        builder: (wasteCode) => {
            return {
                value: wasteCode.id,
                label: wasteCode.label,
            };
        }
    });
});

store.loadWasteCodesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDangerousGoodsRow,
    field: "wasteCode",
});

</script>
<style scoped lang="scss"></style>
