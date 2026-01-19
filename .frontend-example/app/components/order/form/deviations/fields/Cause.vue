<template lang="pug">
FormSelectField(
    v-model="deviationCauseId"
    name="cause"
    :label="$t('deviation_rows.fields.Cause')"
    :label-visible="deviationRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { DeviationCause } from "~/models/DeviationCause";

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const deviationCauseId = computed({
    get: () => getDeviationRow()?.deviationCauseId,
    set: (id: string | null) => {
        const deviationRow = getDeviationRow();

        if (!deviationRow) {
            return;
        }

        const deviationCause = (id) ? useRepo(DeviationCause).find(id) : null;

        deviationRow.deviationCauseId = id;
        deviationRow.deviationCause = deviationCause;
    }
});


const typesAndCausesStore = useOrderFormDeviationTypesAndCausesStore();

const deviationCausesForCurrentDeviationType = computed(() => {
    const deviationRow = getDeviationRow();

    if (!deviationRow || !deviationRow.deviationType) {
        return [];
    }

    return typesAndCausesStore.getDeviationCausesForDeviationType(deviationRow.deviationType);
});

const options = computed(() => {
    const deviationRow = getDeviationRow();
    if (!deviationRow) {
        return [];
    }

    return buildSelectOptions({
        collection: deviationCausesForCurrentDeviationType.value,
        currentObject: deviationRow.deviationCause,
        builder: (deviationCause) => {
            return {
                value: deviationCause.id,
                label: deviationCause.name
            };
        }
    });
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDeviationRow,
    fields: ["deviationCause"],
});

</script>
<style scoped lang="scss"></style>
