<template lang="pug">
FormSelectField(
    v-model="projectId"
    :changed="order.projectIdIsManual"
    name="project"
    :filterable="true"
    :label="$t('order.fields.Project')"
    :options="options"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Project } from "~/models/Project";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const store = useOrderFormProjectsStore();
const { projects } = storeToRefs(store);

const projectId = computed({
    get: () => order.value.projectId,
    set: (id: string) => {
        order.value.projectId = id;
        order.value.projectIdIsManual = true;
        order.value.project = (id) ? useRepo(Project).find(id) : null;
    }
});

const options = computed(() => {
    return buildSelectOptions({
        collection: projects.value,
        currentObject: order.value.project,
        builder: (project) => {
            return {
                value: project.id,
                label: project.name
            };
        }
    });
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "project",
});

store.loadCustomerProjects();

</script>
<style scoped lang="scss"></style>
