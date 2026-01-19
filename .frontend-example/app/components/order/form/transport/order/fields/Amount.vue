<template lang="pug">
FormReadOnlyField(
    :value="amountText"
    name="amount"
    layout="compact"
    :label="$t('transport_orders.fields.Amount')"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { value } = useNumberFieldValue({
    recordAccessor: getTransportOrder,
    valueAttribute: "amount",
    precisionAttribute: "amountPrecision"
});

const amountText = computed(() => {
    if (value.value === null) {
        return null;
    }

    return localizeCurrencyAmount(value.value);
});


</script>
<style scoped lang="scss"></style>
