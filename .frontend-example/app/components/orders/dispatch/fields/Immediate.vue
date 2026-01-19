<template lang="pug">
FormCheckboxField(
    v-model="isImmediate"
    name="isImmediate"
    :disabled="(!!form.unit && !form.unit.isActive)"
    :label="$t('orders.dispatch.fields.Dispatch immediately')"
)
</template>
<script setup lang="ts">

import { ActionType } from "~/enums/ActionType";

const dispatchStore = useOrdersDispatchStore();
const { form, actionType } = storeToRefs(dispatchStore);

const isImmediate = computed<boolean>({
    get: () => actionType.value === ActionType.DispatchTransportOrder,
    set: (value) => {
        // ignore for Plan
        if (actionType.value === ActionType.PlanTransportOrder) {
            return;
        }

        actionType.value = value ? ActionType.DispatchTransportOrder : ActionType.PlanDispatchTransportOrder;
    },
});

</script>
<style scoped lang="scss"></style>
