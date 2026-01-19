<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="title" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="route-actions" v-on:submit.prevent="performAction")
        template(v-if="actionType === RouteActionType.UpdateStatus")
            FormSelectField(
                ref="statusField"
                v-model="form.status"
                name="status-filter"
                :label="$t('route.fields.Status')"
                :options="statusOptions"
                :errors="statusErrors"
                :filterable="true"
                size="large"
            )
        template(v-else)
            FormUnitField(
                ref="unitField"
                v-model="unit"
                name="unit"
                :label="$t('route.fields.Unit')"
                :errors="unitErrors"
                :show-unit-state="true"
            )
        template(v-if="actionType === RouteActionType.Dispatch")
            FormInputField(
                v-model="form.timeoutInMinutes"
                name="timeout"
                size="large"
                type="integer"
                :errors="timeoutInMinutesErrors"
                :label="$t('route.fields.Timeout (minutes)')"
            )
            FormCheckboxField(
                v-model="form.immediateDispatch"
                name="immediateDispatch"
                :disabled="(!!unit && !unit.isActive)"
                :label="$t('route.fields.Dispatch immediately')"
            )
        FormErrors(:errors="formErrors")
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="route-actions"
            :waiting-for="WaitingFor.RouteDialogAction"
            :disabled="!isCurrentActionAllowed"
        ) {{ $t("general.Confirm") }}
</template>
<script setup lang="ts">
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import type { Unit } from "~/models/Unit";

const routeActionsStore = useRoutesListActionsStore();
const {
    form,
    routeFormRecord,
    settableStatuses,
    shouldShowDialog,
    actionType,
    isCurrentActionAllowed
} = storeToRefs(routeActionsStore);
const { showMessage } = useFloatingMessage();
const { t } = useI18n();

const statusField = useTemplateRef("statusField");
const unitField = useTemplateRef("unitField");

const focusFirstField = () => {
    if (statusField.value) {
        statusField.value.focus();
    } else if (unitField.value) {
        unitField.value.focus();
    }
};


const close = () => {
    routeActionsStore.reset();
};

const unit = computed({
    get: () => form.value.unit as Unit | null,
    set: (unit: Unit | null) => {
        form.value.unit = unit;
    }
});

const title = computed(() => {
    switch (actionType.value) {
        case RouteActionType.UpdateStatus:
            return t("route.actions.Update route status");
        case RouteActionType.Plan:
            return t("route.actions.Plan");
        case RouteActionType.Dispatch:
            return t("route.actions.Dispatch");
        default:
            return "";
    }
});

const statusOptions = computed(() => {
    return settableStatuses.value.map((status) => ({
        value: status,
        label: t(`transport_orders.statuses.${status}`)
    }));
});

const successMessageText = computed(() => {
    switch (actionType.value) {
        case RouteActionType.UpdateStatus:
            return t("route.messages.Status updated");
        case RouteActionType.Plan:
            return t("route.messages.Planned");
        case RouteActionType.Dispatch:
            return t("route.messages.Dispatched");
        default:
            return "";
    }
});

const performAction = async () => {
    let actionOk: boolean | undefined = false;
    const messageText = successMessageText.value;
    switch (actionType.value) {
        case RouteActionType.UpdateStatus:
            actionOk = await routeActionsStore.updateRouteStatus();
            break;
        case RouteActionType.Plan:
            actionOk = await routeActionsStore.planRoute();
            break;
        case RouteActionType.Dispatch:
            actionOk = await routeActionsStore.dispatchRoute();
            break;
    }

    if (actionOk) {
        showMessage({
            type: FloatingMessageType.Success,
            text: messageText
        });
        close();
    }
};


const statusErrors = computed(() => {
    return form.value.errors.forRecord(routeFormRecord.value?.routeStatus ?? null);
});

const unitErrors = computed(() => form.value.errors.forField("unit"));

const timeoutInMinutesErrors = computed(() => {
    return new JsonApiErrorCollection(); // :TODO:TMS-2692: implement when API starts returning errors for this field
});

const formErrors = computed(() => {
    return form.value.errors.exceptForRecord(routeFormRecord.value?.routeStatus ?? null).exceptForFields(["unit"]);
});

</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;

    .field {
        margin-bottom: steps(2);
    }
}
</style>
