<template lang="pug">
FormSelectField(
    ref="field"
    v-model="form.invoicingProfileId"
    name="invoicing-profile"
    size="large"
    :filterable="true"
    :label="$t('invoicing.dialog.fields.Invoicing profile')"
    :options="options"
)
</template>
<script setup lang="ts">
const profilesStore = useInvoicingProfilesStore();
profilesStore.loadInvoicingProfilesIfNeeded();
const { invoicingProfiles } = storeToRefs(profilesStore);

const invoicingStore = useInvoicingOrdersInvoicingStore();

const { form } = storeToRefs(invoicingStore);


const options = computed(() => {

    return buildSelectOptions({
        collection: invoicingProfiles.value,
        currentObject: null,
        builder: (profile) => {
            return {
                value: profile.id,
                label: profile.name
            };
        }
    });
});

const field = useTemplateRef("field");

const focus = () => {
    field.value?.focus();
};

defineExpose({
    focus,
});


</script>
<style scoped lang="scss"></style>
