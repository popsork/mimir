<template lang="pug">
FormReadOnlyField(
    :value="unitNumber"
    name="unit"
    layout="compact"
    :label="$t('transport_orders.fields.Unit')"
    :title="unitName ?? undefined"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const unit = computed(() => {
    return getTransportOrder()?.unit;
});

const unitNumber = computed(() => {
    return unit.value?.number || null;
});
const unitName = computed(() => {
    return unit.value?.name || null;
});


</script>
<style scoped lang="scss"></style>
