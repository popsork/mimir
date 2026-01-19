<template lang="pug">
FormReadOnlyField(
    :value="value"
    name="number"
    layout="compact"
    :label="$t('transport_orders.fields.Number')"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { value } = useTextFieldValue({
    recordAccessor: getTransportOrder,
    valueAttribute: "number",
});

</script>
<style scoped lang="scss"></style>
