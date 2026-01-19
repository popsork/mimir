<template lang="pug">
FormSelectField(
    v-model="stageId"
    name="stage"
    :label="$t('transport_orders.fields.Stage')"
    :options="options"
    :filterable="true"
    layout="compact"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { TransportOrderStage } from "~/models/TransportOrderStage";

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { recalculateOrder } = useOrderFormStore();

const stageId = computed({
    get: () => getTransportOrder()?.stageId,
    set: (id: string | null) => {
        const order = getTransportOrder();

        if (!order) {
            return;
        }

        const stage = (id) ? useRepo(TransportOrderStage).find(id) : null;

        order.stageId = id;
        order.stage = stage;
    }
});


const store = useOrderFormTransportOrderStagesStore();
const { stages } = storeToRefs(store);

const options = computed(() => {
    const order = getTransportOrder();
    if (!order) {
        return [];
    }

    return buildSelectOptions({
        collection: stages.value,
        currentObject: order.stage,
        builder: (stage) => {
            return {
                value: stage.id,
                label: stage.label
            };
        }
    });
});

store.loadStagesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    field: "transportOrderStage",
});

</script>
<style scoped lang="scss"></style>
