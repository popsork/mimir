<template lang="pug">
FormSelectField(
    ref="field"
    v-model="routeId"
    name="route"
    size="large"
    :label="label"
    :options="options"
    :filterable="true"
    :remote="true"
    :loading="waitingForSearch"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
)
</template>
<script setup lang="ts">
import type { Route } from "~/models/Route";
import type { SelectOption } from "~/components/form/SelectField.vue";

defineProps<{
    label: string,
}>();

const routeModel = defineModel<Route | null>("route", { default: null });

const addToRouteStore = useOrdersAddToRouteStore();

const { form } = storeToRefs(addToRouteStore);

const routes = computed(() => {
    return form.value.routes as Route[];
});

const searchQuery = computed(() => {
    return form.value.searchQuery;
});

const routeId = computed({
    get: () => routeModel.value?.id,
    set: (id) => {
        let route: Route | null = null;
        if (id) {
            if (routeModel.value?.id === id) {
                route = routeModel.value;
            } else {
                routes.value.find((route) => route.id === id);
            }
        }
        routeModel.value = route || null;
    }
});

const options = computed(() => {
    return buildSelectOptions({
        collection: routes.value,
        currentObject: routeModel.value,
        builder: (route) => {
            return {
                value: route.id,
                label: route.name,
            } as SelectOption;
        }
    });
});

const waitingForSearch = computed(() => {
    return addToRouteStore.waitingForSearch(searchQuery.value);
});

const searchRoutes = (query: string) => {
    if (query === "") {
        clearRouteSearch();
        return;
    }

    const maxNumberOfRoutes = 50;

    addToRouteStore.performRouteSearch({ query, maxNumberOfRoutes });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        searchRoutes("");
        return;
    }

    await nextTick();
    clearRouteSearch();
};

const handleSearch = (query: string) => {
    searchRoutes(query);
};

const clearRouteSearch = () => {
    addToRouteStore.clearRouteSearch();
};

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};

defineExpose({
    focus
});

</script>
<style scoped lang="scss"></style>
