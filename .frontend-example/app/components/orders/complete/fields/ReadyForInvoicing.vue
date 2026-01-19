<template lang="pug">
FormCheckboxField(
    v-model="isReadyForInvoice"
    name="readyForInvoicingValue"
    :label="$t('orders.complete.fields.Verify at once ready for invoice')"
)
</template>
<script setup lang="ts">
import { ActionType } from "~/enums/ActionType";

const completeStore = useOrdersCompleteStore();
const { actionType } = storeToRefs(completeStore);

const isReadyForInvoice = computed<boolean>({
    get: () => actionType.value === ActionType.CompleteAndVerifyTransportOrder,
    set: (value) => {
        actionType.value = value ? ActionType.CompleteAndVerifyTransportOrder : ActionType.CompleteTransportOrder;
    }
});
</script>
<style scoped lang="scss"></style>
