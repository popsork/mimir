<template lang="pug">
FormSelectField(
    v-model="quantityTypeId"
    name="quantity-type",
    :label="$t('specification_rows.fields.Quantity type')"
    :label-visible="specificationRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { SpecificationRowQuantityType } from "~/models/SpecificationRowQuantityType";

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const quantityTypeId = computed({
    get: () => getSpecificationRow()?.quantityTypeId,
    set: (id: string | null) => {
        const specificationRow = getSpecificationRow();

        if (!specificationRow) {
            return;
        }

        const quantityType = (id) ? useRepo(SpecificationRowQuantityType).find(id) : null;

        specificationRow.quantityTypeId = id;
        specificationRow.quantityType = quantityType;
    }
});


const store = useOrderFormSpecificationRowQuantityTypesStore();
const { quantityTypes } = storeToRefs(store);

const options = computed(() => {
    const specificationRow = getSpecificationRow();
    if (!specificationRow) {
        return [];
    }

    return buildSelectOptions({
        collection: quantityTypes.value,
        currentObject: specificationRow.quantityType,
        builder: (quantityType) => {
            return {
                value: quantityType.id,
                label: quantityType.name
            };
        }
    });
});

store.loadQuantityTypesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    field: "specificationRowQuantityType",
});

</script>
<style scoped lang="scss"></style>
