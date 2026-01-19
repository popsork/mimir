<template lang="pug">
FormPopoverField(
    ref="popover"
    name="contact"
    :label="$t('stops.fields.Contact')"
    layout="compact"
    :value="displayableValue"
    :errors="errors"
    v-on:open="focusFirstInput"
    v-on:close="resetInternalContactValues"
)
    template(v-slot:popover)
        GenericForm(data-name="contact-values" v-on:submit.prevent="updateContactValues")
            FormInputField(
                ref="firstInput"
                v-model="internalContactValues.contact"
                type="text"
                size="medium"
                layout="compact"
                :label="$t('stops.fields.Contact name')"
            )
            FormInputField(
                v-model="internalContactValues.phone"
                size="medium"
                type="text"
                layout="compact"
                :label="$t('stops.fields.Phone')"
            )
            FormInputField(
                v-model="internalContactValues.email"
                size="medium"
                type="text"
                layout="compact"
                :label="$t('stops.fields.E-mail')"
            )
            .actions
                GenericButton(type="ghost" size="small" v-on:click="cancel") {{ $t('general.Cancel') }}
                GenericButton(type="primary" button-type="submit" size="small") {{ $t('stops.actions.Update') }}
</template>
<script setup lang="ts">
const props = defineProps<{
    stopIndex: number,
}>();

const { getStop } = useOrderFormStopAccessor(() => props.stopIndex);

type ContactValues = {
    contact: string | null,
    phone: string | null,
    email: string | null,
};

const { value: contact } = useTextFieldValue({
    recordAccessor: getStop,
    valueAttribute: "contact",
});
const { value: phone } = useTextFieldValue({
    recordAccessor: getStop,
    valueAttribute: "phone",
});
const { value: email } = useTextFieldValue({
    recordAccessor: getStop,
    valueAttribute: "email",
});

const contactValues = computed({
    get: () => {
        const result: ContactValues = {
            contact: contact.value,
            phone: phone.value,
            email: email.value,
        };
        return result;
    },
    set: (value: ContactValues) => {
        contact.value = value.contact === "" ? null : value.contact;
        phone.value = value.phone === "" ? null : value.phone;
        email.value = value.email === "" ? null : value.email;
    }
});

const internalContactValues = ref<ContactValues>({
    contact: null,
    phone: null,
    email: null,
});

watch(contactValues, (newValue) => {
    internalContactValues.value = clone(newValue);
}, { deep: true, immediate: true });

const resetInternalContactValues = () => {
    internalContactValues.value = clone(contactValues.value);
};

const updateContactValues = () => {
    contactValues.value = internalContactValues.value;
    closePopover();
};

const cancel = () => {
    resetInternalContactValues();
    closePopover();
};

const popover = useTemplateRef("popover");
const closePopover = () => {
    if (popover.value) {
        popover.value.close();
    }
};

const displayableValue = computed(() => {
    // displayed values are always taken from the object in the store and not the internal state
    const values = contactValues.value;

    const valueParts = [
        values.contact,
        values.phone,
        values.email
    ].filter(value => value !== null && value !== "");

    return valueParts.join(", ");
});

const firstInput = useTemplateRef("firstInput");

const focusFirstInput = async () => {
    await nextTick();
    if (firstInput.value) {
        firstInput.value.focus();
    }
};

// since contact is a custom compound field, it should display errors for all attributes that are used inside it
const { errors } = useOrderFormFieldErrors({
    recordAccessor: getStop,
    fields: [
        "contact",
        "phone",
        "email",
    ],
});

</script>
<style scoped lang="scss">
form[data-name="contact-values"] {
    width: steps(26);

    .field {
        margin-bottom: steps(1.5);
    }

    .actions {
        display: flex;
        gap: steps(1);

        .button {
            flex: 1 1 50%;
        }
    }
}
</style>
