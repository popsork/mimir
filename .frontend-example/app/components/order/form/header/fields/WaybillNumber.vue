<template lang="pug">
FormInputField(
    v-model="waybillNumber"
    :changed="order.waybillNumberIsManual"
    name="waybill_number"
    :label="$t('order.fields.Waybill number')"
    :waiting-for="WaitingFor.OrderFormWaybillNumber"
    :errors="errors"
)
    template(v-slot:suffix)
        button(type="button" :title="$t('order.actions.Generate new waybill number')" v-on:click="generateWaybillNumber")
            SvgImage(name="arrows-cycle")

</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const waybillNumber = computed({
    get: () => order.value.waybillNumber,
    set: (value: string | null) => {
        order.value.waybillNumber = value;
        order.value.waybillNumberIsManual = true;
    }
});

const waybillsStore = useOrderFormWaybillsStore();

const { t } = useI18n();
const { showMessage } = useFloatingMessage();
const generateWaybillNumber = async () => {
    const waybill = await waybillsStore.createWaybill();

    if (!waybill) {
        showMessage({
            type: FloatingMessageType.Error,
            text: t("order.messages.No unused waybill numbers are available")
        });
        return;
    }

    waybillNumber.value = waybill.number;
};

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "waybill",
});

</script>
<style scoped lang="scss"></style>
