<template lang="pug">
FormSelectField(
    v-model="lineId"
    name="line"
    :label="label"
    :options="options"
    :filterable="true"
    layout="compact"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Line } from "~/models/Line";

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { recalculateOrder } = useOrderFormStore();

const lineId = computed({
    get: () => getTransportOrder()?.lineId,
    set: (id: string | null) => {
        const order = getTransportOrder();

        if (!order) {
            return;
        }

        const line = (id) ? useRepo(Line).find(id) : null;

        order.lineId = id;
        order.line = line;
    }
});

const { t } = useI18n();
const label = computed(() => {
    const order = getTransportOrder();
    if (order?.line?.type == LineType.DistributionArea) {
        return t("transport_orders.fields.Distribution area");
    }
    return t("transport_orders.fields.Line");
});

const store = useOrderFormLinesStore();
const { lines } = storeToRefs(store);

const options = computed(() => {
    const order = getTransportOrder();
    if (!order) {
        return [];
    }

    return buildSelectOptions({
        collection: lines.value,
        currentObject: order.line,
        builder: (line) => {
            return {
                value: line.id,
                label: line.name
            };
        }
    });
});

store.loadLinesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    field: "line",
});


</script>
<style scoped lang="scss"></style>
