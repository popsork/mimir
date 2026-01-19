<template lang="pug">
FormSelectField(
    v-model="cargoTypeId"
    :changed="order.cargoTypeIdIsManual"
    name="cargo_type"
    :label="$t('order.fields.Cargo type')"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { CargoType } from "~/models/CargoType";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const cargoTypeId = computed({
    get: () => order.value.cargoTypeId,
    set: (id: string) => {
        order.value.cargoTypeId = id;
        order.value.cargoTypeIdIsManual = true;
        order.value.cargoType = (id) ? useRepo(CargoType).find(id) : null;
    }
});

const store = useOrderFormCargoTypesStore();
const { cargoTypes } = storeToRefs(store);

const options = computed(() => {
    return buildSelectOptions({
        collection: cargoTypes.value,
        currentObject: order.value.cargoType,
        builder: (cargoType) => {
            return {
                value: cargoType.id,
                label: cargoType.name
            };
        }
    });
});

store.loadCargoTypesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "cargoType",
});

</script>
<style scoped lang="scss"></style>
