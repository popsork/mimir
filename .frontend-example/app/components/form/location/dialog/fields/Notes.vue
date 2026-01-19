<template lang="pug">
FormInputField(
    ref="field"
    v-model="form.destination.notes"
    name="notes"
    size="large"
    :label="$t('locations.fields.Notes')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("information"));

</script>
<style scoped lang="scss"></style>
