<template lang="pug">
FormInputField(
    v-model="customerReference"
    :changed="order.customerReferenceIsManual"
    name="customer_reference"
    :label="$t('order.fields.Customer reference')"
    :errors="customerReferenceErrors"
)
FormInputField(
    v-model="senderReference"
    :changed="order.senderReferenceIsManual"
    name="sender_reference"
    :label="$t('order.fields.Sender reference')"
    :errors="senderReferenceErrors"
)
FormInputField(
    v-model="recipientReference"
    :changed="order.recipientReferenceIsManual"
    name="recipient_reference"
    :label="$t('order.fields.Recipient reference')"
    :errors="recipientReferenceErrors"
)
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const recordAccessor = () => order.value;

const customerReference = computed({
    get: () => order.value.customerReference,
    set: (value: string) => {
        order.value.customerReference = value;
        order.value.customerReferenceIsManual = true;
    }
});

const senderReference = computed({
    get: () => order.value.senderReference,
    set: (value: string) => {
        order.value.senderReference = value;
        order.value.senderReferenceIsManual = true;
    }
});

const recipientReference = computed({
    get: () => order.value.recipientReference,
    set: (value: string) => {
        order.value.recipientReference = value;
        order.value.recipientReferenceIsManual = true;
    }
});

const { errors: customerReferenceErrors } = useOrderFormFieldErrors({
    recordAccessor,
    field: "customer_reference",
});

const { errors: senderReferenceErrors } = useOrderFormFieldErrors({
    recordAccessor,
    field: "sender_reference",
});

const { errors: recipientReferenceErrors } = useOrderFormFieldErrors({
    recordAccessor,
    field: "recipient_reference",
});


</script>
<style scoped lang="scss"></style>
