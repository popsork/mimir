<template lang="pug">
FormInputField(
    ref="field"
    v-model="form.destination.email"
    name="email"
    size="large"
    :label="$t('locations.fields.E-mail')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("email"));

</script>
<style scoped lang="scss"></style>
