<template lang="pug">
fieldset.header(ref="header")
    .fieldsets
        OrderFormHeaderMain
        OrderFormHeaderReferences
        OrderFormHeaderRequirements
        OrderFormHeaderNotes
        OrderFormHeaderAdditionalServices
    FormErrors(:errors="generalErrors")
</template>
<script setup lang="ts">
import type { CustomerOrderApiResourceFieldName } from "~/models/CustomerOrder";


useElementHeightTracking("orderFormHeader", useTemplateRef("header"));

const { form, order } = storeToRefs(useOrderFormStore());

const generalErrors = computed(() => {
    return orderErrors.value.concat(otherErrors.value);
});

const usedFieldNames: CustomerOrderApiResourceFieldName[] = [
    // "template_name" is not included here, because the field is not always shown,
    // so its safer to always show its errors in general errors
    "customer", "contact", "contact_name_override", "agreement", "project",
    "waybill", "customer_reference", "sender_reference", "recipient_reference",
    "planned_pickup_at", "planned_delivery_at", "operation", "service", "cargoType"
];

// this should return all errors which refer to the customer order record
// but have not been displayed in any of the fields in the header fieldsets
const orderErrors = computed(() => form.value.errors.forRecord(order.value).exceptForFields(usedFieldNames));

// this should return all other general errors which don't have a resource and are therefore not displayed elsewhere
const otherErrors = computed(() => {
    return form.value.errors.withoutResource();
});


</script>
<style scoped lang="scss">
.header {
    .fieldsets {
        display: flex;
        gap: steps(2);

        @include content-padding;
        padding-top: steps(2.5);

        fieldset {
            flex: 1 1 auto;
        }

        // the total number of steps for 5 fieldsets should sum to 227 (235 steps total minus 4 gaps of 2 steps)
        fieldset[data-name="main"] {
            flex-basis: steps(37);
        }

        fieldset[data-name="references"] {
            flex-basis: steps(23);
        }

        // to make the requirements field inputs the same width as references,
        // the requirements fieldset should be 2x-steps(1) where x is references fieldset width
        fieldset[data-name="requirements"] {
            flex-basis: steps(45);
        }

        fieldset[data-name="notes"] {
            flex-basis: steps(85);
        }

        fieldset[data-name="additional-services"] {
            flex-basis: steps(37);
        }
    }
    .errors {
        @include content-padding;
        padding-top: steps(1);
    }
}
</style>
