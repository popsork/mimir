<template lang="pug">
FormSelectField(
    v-model="activityId"
    v-model:custom-value="activityNameOverride"
    name="activity"
    :label="$t('specification_rows.fields.Activity')"
    :label-visible="specificationRowIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Activity } from "~/models/Activity";

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const activityId = computed({
    get: () => getSpecificationRow()?.activityId,
    set: (id: string | null) => {
        const specificationRow = getSpecificationRow();

        if (!specificationRow) {
            return;
        }

        const activity = (id) ? useRepo(Activity).find(id) : null;

        specificationRow.activityId = id;
        specificationRow.activity = activity;
    }
});

const { value: activityNameOverride } = useTextFieldValue({
    recordAccessor: getSpecificationRow,
    valueAttribute: "activityNameOverride",
});


const activitiesStore = useOrderFormActivitiesStore();

const { order } = storeToRefs(useOrderFormStore());

const activitiesForCurrentProject = computed(() => activitiesStore.getActivitiesForProject(order.value.project));

const options = computed(() => {
    const specifiationRow = getSpecificationRow();
    if (!specifiationRow) {
        return [];
    }

    return buildSelectOptions({
        collection: activitiesForCurrentProject.value,
        currentObject: specifiationRow.activity,
        builder: (activity) => {
            return {
                value: activity.id,
                label: activity.name
            };
        }
    });
});

activitiesStore.loadActivitiesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    fields: ["activity", "activity_name_override"],
});

</script>
<style scoped lang="scss"></style>
