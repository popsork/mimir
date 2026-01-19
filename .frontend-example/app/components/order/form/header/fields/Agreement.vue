<template lang="pug">
FormSelectField(
    v-model="agreementId"
    :changed="order.agreementIdIsManual"
    name="agreement"
    :filterable="true"
    :label="$t('order.fields.Agreement')"
    :options="options"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Agreement } from "~/models/Agreement";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const agreementId = computed({
    get: () => order.value.agreementId,
    set: (id: string) => {
        order.value.agreementId = id;
        order.value.agreementIdIsManual = true;
        order.value.agreement = (id) ? useRepo(Agreement).find(id) : null;
    }
});

const store = useOrderFormAgreementsStore();
const { agreements } = storeToRefs(store);

const options = computed(() => {
    return buildSelectOptions({
        collection: agreements.value,
        currentObject: order.value.agreement,
        builder: (agreement) => {
            return {
                value: agreement.id,
                label: agreement.name
            };
        }
    });
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "agreement",
});

store.loadCustomerAgreements();

</script>
<style scoped lang="scss"></style>
