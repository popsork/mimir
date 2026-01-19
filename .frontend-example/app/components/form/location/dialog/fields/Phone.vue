<template lang="pug">
FormInputField(
    ref="field"
    v-model="form.destination.phone"
    name="phone"
    size="large"
    :label="$t('locations.fields.Phone')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("phone"));

</script>
<style scoped lang="scss"></style>
