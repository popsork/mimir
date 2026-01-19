<template lang="pug">
GenericForm(id="route-form" data-name="route" :prevent-submission-on-enter="true" v-on:submit.prevent="saveRoute")
    RouteSidebarFormRouteFieldset
    FormErrors(:errors="generalErrors")
    RouteSidebarFormStopsFieldset
</template>
<script setup lang="ts">
const store = useRouteFormStore();

const { routeIsNew, savingIsEnabled, form } = storeToRefs(store);

const { showMessage } = useFloatingMessage();
const { t } = useI18n();

const saveRoute = async () => {
    if (!savingIsEnabled.value) {
        return;
    }

    const savingNewRoute = routeIsNew.value;
    const shouldRedirectAfterSave = savingNewRoute;

    const savedRoute = await store.saveRoute({ processStops: true, processStatus: false });
    if (!savedRoute) {
        return;
    }

    const successText = savingNewRoute
        ? t("route.messages.Route created with name X", { name: savedRoute.name })
        : t("route.messages.Route updated successfully");

    showMessage({
        type: FloatingMessageType.Success,
        text: successText
    });

    if (!shouldRedirectAfterSave) {
        return;
    }

    goToRoute({ name: "routes-id", params: { id: savedRoute.id } }, { replace: true });
};

const generalErrors = computed(() => {
    return form.value.errors.exceptForFields(["name", "startAt"]);
});

</script>
<style scoped lang="scss">
form {
    display: flex;
    flex-direction: column;
    gap: steps(2);
}
</style>
