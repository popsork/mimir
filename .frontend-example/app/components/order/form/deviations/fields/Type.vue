<template lang="pug">
FormSelectField(
    v-model="deviationTypeId"
    name="type"
    :label="$t('deviation_rows.fields.Type')"
    :label-visible="deviationRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { DeviationType } from "~/models/DeviationType";

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const deviationTypeId = computed({
    get: () => getDeviationRow()?.deviationTypeId,
    set: (id: string | null) => {
        const deviationRow = getDeviationRow();

        if (!deviationRow) {
            return;
        }

        const valueIsBeingChanged = id !== deviationRow.deviationTypeId;

        const deviationType = (id) ? useRepo(DeviationType).find(id) : null;

        deviationRow.deviationTypeId = id;
        deviationRow.deviationType = deviationType;

        if (valueIsBeingChanged) {
            deviationRow.deviationCauseId = null;
            deviationRow.deviationCause = null;
        }
    }
});


const typesAndCausesStore = useOrderFormDeviationTypesAndCausesStore();

const { deviationTypes } = storeToRefs(typesAndCausesStore);

const options = computed(() => {
    const deviationRow = getDeviationRow();
    if (!deviationRow) {
        return [];
    }

    return buildSelectOptions({
        collection: deviationTypes.value,
        currentObject: deviationRow.deviationType,
        builder: (deviationType) => {
            return {
                value: deviationType.id,
                label: deviationType.name
            };
        }
    });
});

typesAndCausesStore.loadDeviationTypesAndCausesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDeviationRow,
    fields: ["deviationType"],
});

</script>
<style scoped lang="scss"></style>
