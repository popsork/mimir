<template lang="pug">
FormInputField(
    ref="field"
    v-model="form.destination.name"
    name="name"
    size="large"
    :label="$t('locations.fields.Name')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("name"));

const field = useTemplateRef("field");

const focus = () => {
    field.value?.focus();
};

defineExpose({
    focus,
});

</script>
<style scoped lang="scss"></style>
