<template lang="pug">
FormUnitField(
    ref="field"
    v-model="internalUnit"
    name="unit"
    :label="label"
    :errors="errors"
    :show-unit-state="shouldShowUnitState"
)
</template>
<script setup lang="ts">
import type { Unit } from "~/models/Unit";

const props = defineProps<{
    label: string,
    errors: FormFieldError[],
    dialogMode: "dispatch" | "complete",
}>();

const unitModel = defineModel<Unit | null>("unit", { default: null });
const actionTypeModel = defineModel<ActionType>("actionType", { default: ActionType.DispatchTransportOrder });

const shouldShowUnitState = computed(() => {
    // unit state is not relevant for completing transport orders
    return props.dialogMode === "dispatch";
});

const internalUnit = computed({
    get: () => unitModel.value,
    set: (unit: Unit | null) => {
        unitModel.value = unit;

        // ignore for complete and verify transport-order
        if (props.dialogMode === "complete") {
            return;
        }

        // In dispatch, if the unit is selected, adjust the immediate dispatch checkbox based on the unit's active status
        // this also switches dialog from Undispatch to Dispatch if a unit gets selected
        if (actionTypeModel.value !== ActionType.PlanTransportOrder) {
            if (!unit || unit.isActive) {
                actionTypeModel.value = ActionType.DispatchTransportOrder;
                return;
            }
            actionTypeModel.value = ActionType.PlanDispatchTransportOrder;
        }
    }
});

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
