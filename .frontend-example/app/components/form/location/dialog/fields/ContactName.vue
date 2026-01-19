<template lang="pug">
FormInputField(
    ref="field"
    v-model="form.destination.contact"
    name="contact-name"
    size="large"
    :label="$t('locations.fields.Contact name')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("contact"));

</script>
<style scoped lang="scss"></style>
