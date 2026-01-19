<template lang="pug">
FormDateField(
    v-model="form.completedAtDateTime"
    type="datetime"
    size="large"
    :label="$t('orders.complete.fields.Completed at')"
    name="completed_at"
    container-mode="modal-dialog"
    :errors="errors"
    :max-date="maxDate"
)
</template>
<script setup lang="ts">
const completeStore = useOrdersCompleteStore();
const { form } = storeToRefs(completeStore);

const errors = computed(() => form.value.errors.forField("completed_at"));

const maxDate = getUtcDatetimeString(new Date());
</script>
<style scoped lang="scss"></style>
