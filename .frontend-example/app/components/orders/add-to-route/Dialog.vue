<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="$t('orders.add_to_route.messages.Add to route')" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="add-to-route" v-on:submit.prevent="addSelectedOrdersToRoute")
        OrdersAddToRouteFieldsRoute(
            ref="firstField"
            v-model:route="routeModel"
            :label="routeLabel"
        )
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="add-to-route"
            icon="arrow-outward"
            :waiting-for="WaitingFor.AddingToRoute"
        ) {{ $t('orders.add_to_route.messages.Add to route') }}
</template>
<script setup lang="ts">
import type { Route } from "~/models/Route";

const { t } = useI18n();
const { showMessage } = useFloatingMessage();

const addToRouteStore = useOrdersAddToRouteStore();
const {
    form,
    shouldShowDialog
} = storeToRefs(addToRouteStore);

const routeModel = computed({
    get: () => form.value.route as Route | null,
    set: (route: Route | null) => {
        form.value.route = route;
    }
});

const routeLabel = t("orders.add_to_route.fields.Route");

const firstField = useTemplateRef("firstField");

const focusFirstField = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};

const close = () => {
    addToRouteStore.clearFormAndCloseDialog();
};

const addSelectedOrdersToRoute = async () => {
    if (!routeModel.value) {
        showMessage({
            type: FloatingMessageType.Error,
            text: t("orders.add_to_route.messages.Missing route"),
        });
        return;
    }

    const addingOk = await addToRouteStore.addSelectedOrdersToRoute();

    if (!addingOk) {
        showMessage({
            type: FloatingMessageType.Error,
            text: t("orders.add_to_route.messages.Failed to add orders to route"),
        });
        return;
    }

    const routeId = routeModel.value.id;

    close();
    goToRoute({
        name: "routes-id",
        params: { id: routeId }
    }, { replace: true });
};

</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;

    .field {
        margin-bottom: steps(2);
    }
}
</style>
