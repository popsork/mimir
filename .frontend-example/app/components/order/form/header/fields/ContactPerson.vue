<template lang="pug">
FormSelectField(
    v-model="contactId"
    v-model:custom-value="contactNameOverride"
    :changed="currentValueIsManual"
    name="contact_person"
    :filterable="true"
    :label="$t('order.fields.Contact person')"
    :options="options"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Contact } from "~/models/Contact";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const store = useOrderFormContactsStore();
const { contacts } = storeToRefs(store);

const contactId = computed({
    get: () => order.value.contactId,
    set: (id: string | null) => {
        order.value.contactId = id;
        order.value.contactIdIsManual = true;
        order.value.contact = (id) ? useRepo(Contact).find(id) : null;
    }
});

const contactNameOverride = computed({
    get: () => order.value.contactNameOverride,
    set: (name: string | null) => {
        order.value.contactNameOverride = name;
        order.value.contactNameOverrideIsManual = true;
    }
});

const currentValueIsManual = computed(() => {
    if (order.value.contactId) {
        return order.value.contactIdIsManual;
    }
    return order.value.contactNameOverrideIsManual;
});


const options = computed(() => {
    return buildSelectOptions({
        collection: contacts.value,
        currentObject: order.value.contact,
        builder: (contact) => {
            return {
                value: contact.id,
                label: contact.name
            };
        }
    });
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    fields: ["contact", "contact_name_override"],
});

store.loadCustomerContacts();

</script>
<style scoped lang="scss"></style>
