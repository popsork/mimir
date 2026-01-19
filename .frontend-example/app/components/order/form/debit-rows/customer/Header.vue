<template lang="pug">
OrderFormDebitRowsHeader(icon="person")
    template(v-slot:content)
        span.text {{ customerName }}
    template(v-slot:actions)
        slot
</template>
<script setup lang="ts">

const { form } = storeToRefs(useOrderFormStore());

const customerName = computed(() => {
    const order = form.value.order;
    if (!order || !order.customer) {
        return getBlankValueLabelText();
    }
    return order.customer.name;
});

</script>
<style scoped lang="scss">
.header {
    .text {
        @include large-medium-text;
    }
}
</style>
